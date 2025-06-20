import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StripeService } from '../stripe/stripe.service';
import { Membership } from './membership/entities/membership.entity';
import { MembershipType } from './membershipTypes/entities/membershipType.entity';
import Stripe from 'stripe';
import { User } from '../users/entities/user.entity';
import { Client } from '../users/entities/client.entity';
import { Employee } from '../users/entities/employee.entity';
import { MembershipStatus } from 'src/catalogues/MembershipStatus/entities/membership-status.entity';
import { CreateSubscriptionDto } from './create-subscription.dto';
import { CustomerService } from 'src/master_data/customer/customer.service';
import { CompanySubscriptionService } from 'src/master_data/company_subscription/company-subscription.service';
import { GlobalMembershipType } from 'src/master_data/global_membership_type/entities/global-membership-type.entity';
import { CreateCustomerDto } from 'src/master_data/customer/dto/create-customer.dto';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly stripeService: StripeService,
    private readonly customerService: CustomerService,
    private readonly companySubscriptionService: CompanySubscriptionService,
  ) {}

  async createSubscriptionCheckout(dto: CreateSubscriptionDto) {
    const { email, price_id, first_name, last_name } = dto;
    const customerName =
      first_name && last_name ? `${first_name} ${last_name}` : email;

    const stripeCustomer = await this.stripeService.findOrCreateCustomer(
      email,
      customerName,
    );

    const successUrl = 'http://AcaPonerPagina/pago-exitoso';
    const cancelUrl = 'http://AcaPonerPagina/pago-cancelado';

    const checkoutSession =
      await this.stripeService.createSubscriptionCheckoutSession(
        stripeCustomer.id,
        price_id,
        successUrl,
        cancelUrl,
        {
          context: dto.context,
          customer_id: dto.customer_id!,
        },
      );

    return { checkoutUrl: checkoutSession.url };
  }

  async isClientMembershipActive(userId: string): Promise<boolean> {
    const user = await this.dataSource.getRepository(User).findOne({
      where: { id: userId },
      relations: ['client'],
    });

    if (!user || !user.client) {
      return false;
    }

    const membership = await this.dataSource.getRepository(Membership).findOne({
      where: {
        client: { id: user.client.id },
        status: { membershipStatus: 'active' },
      },
      order: { expiration_date: 'DESC' },
    });

    if (!membership) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(membership.expiration_date) >= today;
  }

  async isCustomerSubscriptionActive(customerId: string): Promise<boolean> {
    const subscription =
      await this.companySubscriptionService.findActiveSubscriptionForCustomer(
        customerId,
      );

    if (!subscription) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(subscription.end_date) >= today;
  }

  async handleSubscriptionWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.processCheckoutSession(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case 'invoice.paid':
        await this.processPaidInvoice(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.updated':
        await this.processUpdatedSubscription(
          event.data.object as Stripe.Subscription,
        );
        break;
      case 'customer.subscription.deleted':
        await this.processCanceledSubscription(
          event.data.object as Stripe.Subscription,
        );
        break;
      case 'invoice.payment_failed':
        await this.processFailedPayment(event.data.object as Stripe.Invoice);
        break;
      default:
        this.logger.log(` Evento '${event.type}' no requiere acción.`);
    }
  }

  private async processCheckoutSession(session: Stripe.Checkout.Session) {
    if (session.mode !== 'subscription' || !session.subscription) {
      return;
    }

    const context = session.metadata?.context;

    this.logger.log(
      `Procesando checkout de suscripción con contexto: "${context}"`,
    );

    if (context === 'customer') {
      await this.createCompanySubscriptionFromWebhook(session);
    } else if (context === 'client') {
      await this.createClientMembershipFromWebhook(session);
    } else {
      this.logger.error(
        `Contexto de suscripción desconocido o ausente en metadatos para la sesión ${session.id}`,
      );
    }
  }

  private async createCompanySubscriptionFromWebhook(
    session: Stripe.Checkout.Session,
  ) {
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    const existingSubscription =
      await this.companySubscriptionService.findOneByStripeId(subscriptionId);
    if (existingSubscription) {
      this.logger.warn(
        `La CompanySubscription para ${subscriptionId} ya existe en la base de datos maestra.`,
      );
      return;
    }

    try {
      const invoice = (
        await this.stripeService.listInvoices({
          subscription: subscriptionId,
          limit: 1,
        })
      ).data[0];
      const stripeCustomer =
        await this.stripeService.retrieveCustomer(customerId);

      if (!stripeCustomer.email) {
        this.logger.error(
          `El cliente de Stripe con ID ${customerId} no tiene un email asociado. No se puede procesar la suscripción.`,
        );
        return;
      }

      let customer = await this.customerService.findOneByEmail(
        stripeCustomer.email,
      );

      if (!customer) {
        this.logger.log(
          `Customer con email ${stripeCustomer.email} no encontrado. Creando nuevo Customer.`,
        );

        const createCustomerDto: CreateCustomerDto = {
          name: stripeCustomer.name || 'Nueva Empresa',
          email: stripeCustomer.email,
          slug: (stripeCustomer.name || 'empresa')
            .toLowerCase()
            .replace(/ /g, '-'),
          db_connection_string: 'TBD',
        };

        customer = await this.customerService.create(createCustomerDto);
      }

      const subscription =
        await this.stripeService.retrieveSubscription(subscriptionId);
      const globalMembershipType = await this.dataSource
        .getRepository(GlobalMembershipType)
        .findOne({
          where: { stripe_price_id: subscription.items.data[0].price.id },
        });

      if (!invoice || !globalMembershipType) {
        throw new Error(
          'Faltan datos maestros (GlobalMembershipType) para crear la CompanySubscription.',
        );
      }

      const newCompanySubscription =
        await this.companySubscriptionService.create({
          customer_id: customer.id,
          membership_type_id: globalMembershipType.id,
          stripe_subscription_id: subscriptionId,
          start_date: new Date(invoice.period_start * 1000),
          end_date: new Date(invoice.period_end * 1000),
          status: 'active',
          paymentStatus: 'paid',
        });

      this.logger.log(
        `CompanySubscription ${newCompanySubscription.id} creada para la empresa ${customer.name}.`,
      );
    } catch (error) {
      this.logger.error(
        `Error en createCompanySubscriptionFromWebhook: ${error.message}`,
        error.stack,
      );
    }
  }

  private async createClientMembershipFromWebhook(
    session: Stripe.Checkout.Session,
  ) {
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    const existingMembership = await this.dataSource.manager.findOneBy(
      Membership,
      { stripe_subscription_id: subscriptionId },
    );
    if (existingMembership) {
      this.logger.warn(
        `La membresía para ${subscriptionId} ya existe en la base de datos del inquilino.`,
      );
      return;
    }

    try {
      const invoice = (
        await this.stripeService.listInvoices({
          subscription: subscriptionId,
          limit: 1,
        })
      ).data[0];
      const stripeCustomer =
        await this.stripeService.retrieveCustomer(customerId);
      const user = await this.findOrCreateUserByEmail(stripeCustomer);
      const subscription =
        await this.stripeService.retrieveSubscription(subscriptionId);
      const membershipType = await this.dataSource.manager.findOneBy(
        MembershipType,
        { stripe_price_id: subscription.items.data[0].price.id },
      );
      const activeStatus = await this.dataSource.manager.findOneBy(
        MembershipStatus,
        { membershipStatus: 'active' },
      );

      if (!invoice || !membershipType || !activeStatus || !user) {
        throw new Error(
          'Faltan datos maestros del inquilino para crear la membresía.',
        );
      }

      const newMembership = this.dataSource.manager.create(Membership, {
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
        type: membershipType,
        status: activeStatus,
        creation_date: new Date(invoice.period_start * 1000)
          .toISOString()
          .split('T')[0],
        expiration_date: new Date(invoice.period_end * 1000)
          .toISOString()
          .split('T')[0],
      });

      let client = user.client;
      if (!client) {
        client = this.dataSource.manager.create(Client, { user });
        await this.dataSource.manager.save(client);
      }
      newMembership.client = client;

      await this.dataSource.manager.save(newMembership);
      this.logger.log(
        `Membresía de Cliente Final ${newMembership.id} creada para ${user.email}.`,
      );
    } catch (error) {
      this.logger.error(
        `Error en createClientMembershipFromWebhook: ${error.message}`,
        error.stack,
      );
    }
  }

  private async processPaidInvoice(invoice: Stripe.Invoice) {
    const subscriptionId = invoice['subscription'] as string;
    if (!subscriptionId) return;

    const subscription =
      await this.stripeService.retrieveSubscription(subscriptionId);
    const context = subscription.metadata.context;

    if (context === 'customer') {
      const companySubscription =
        await this.companySubscriptionService.findOneByStripeId(subscriptionId);
      if (companySubscription) {
        companySubscription.end_date = new Date(invoice.period_end * 1000);
        companySubscription.payment_status = 'paid';
        companySubscription.status = 'active';
        await this.companySubscriptionService.update(
          companySubscription.id,
          companySubscription,
        );
        this.logger.log(
          `Suscripción de Empresa ${companySubscription.id} renovada.`,
        );
      }
    } else if (context === 'client') {
      const membership = await this.dataSource.manager.findOneBy(Membership, {
        stripe_subscription_id: subscriptionId,
      });
      if (membership) {
        membership.expiration_date = new Date(invoice.period_end * 1000)
          .toISOString()
          .split('T')[0];
        const activeStatus = await this.dataSource.manager.findOneBy(
          MembershipStatus,
          { membershipStatus: 'active' },
        );
        if (activeStatus) membership.status = activeStatus;
        await this.dataSource.manager.save(membership);
        this.logger.log(
          `Membresía de Cliente Final ${membership.id} renovada.`,
        );
      }
    }
  }

  private async processUpdatedSubscription(subscription: Stripe.Subscription) {
    const context = subscription.metadata.context;
    const stripeSubscriptionId = subscription.id;

    if (context === 'customer') {
      const companySubscription =
        await this.companySubscriptionService.findOneByStripeId(
          stripeSubscriptionId,
        );
      if (companySubscription) {
        const newPriceId = subscription.items.data[0].price.id;
        const newGlobalMembershipType = await this.dataSource
          .getRepository(GlobalMembershipType)
          .findOne({ where: { stripe_price_id: newPriceId } });

        if (newGlobalMembershipType) {
          companySubscription.membership_type_id = newGlobalMembershipType.id;
        }
        companySubscription.end_date = new Date(
          subscription['current_period_end'] * 1000,
        );

        await this.companySubscriptionService.update(
          companySubscription.id,
          companySubscription,
        );
        this.logger.log(
          `Suscripción de Empresa ${companySubscription.id} actualizada al plan '${newGlobalMembershipType?.name}'.`,
        );
      }
    } else if (context === 'client') {
      const membership = await this.dataSource.manager.findOneBy(Membership, {
        stripe_subscription_id: stripeSubscriptionId,
      });
      if (membership) {
        const newPriceId = subscription.items.data[0].price.id;
        const newMembershipType = await this.dataSource.manager.findOneBy(
          MembershipType,
          { stripe_price_id: newPriceId },
        );

        if (newMembershipType) {
          membership.type = newMembershipType;
        }
        membership.expiration_date = new Date(
          subscription['current_period_end'] * 1000,
        )
          .toISOString()
          .split('T')[0];

        await this.dataSource.manager.save(membership);
        this.logger.log(
          `Membresía de Cliente Final ${membership.id} actualizada al plan '${newMembershipType?.name}'.`,
        );
      }
    }
  }

  private async processCanceledSubscription(subscription: Stripe.Subscription) {
    const context = subscription.metadata.context;
    const stripeSubscriptionId = subscription.id;

    if (context === 'customer') {
      const companySubscription =
        await this.companySubscriptionService.findOneByStripeId(
          stripeSubscriptionId,
        );
      if (companySubscription) {
        companySubscription.status = 'cancelled';
        await this.companySubscriptionService.update(
          companySubscription.id,
          companySubscription,
        );
        this.logger.log(
          `Suscripción de Empresa ${companySubscription.id} marcada como cancelada.`,
        );
      }
    } else if (context === 'client') {
      const membership = await this.dataSource.manager.findOneBy(Membership, {
        stripe_subscription_id: stripeSubscriptionId,
      });
      if (membership) {
        const canceledStatus = await this.dataSource.manager.findOneBy(
          MembershipStatus,
          { membershipStatus: 'cancelled' },
        );
        if (!canceledStatus) {
          throw new InternalServerErrorException(
            "Estado 'cancelled' no encontrado en la DB del inquilino.",
          );
        }
        membership.status = canceledStatus;
        await this.dataSource.manager.save(membership);
        this.logger.log(
          `Membresía de Cliente Final ${membership.id} marcada como cancelada.`,
        );
      }
    }
  }

  private async processFailedPayment(invoice: Stripe.Invoice) {
    const subscriptionId = invoice['subscription'] as string;
    if (!subscriptionId) {
      this.logger.warn(
        'Webhook de "invoice.payment_failed" recibido sin un ID de suscripción.',
      );
      return;
    }

    try {
      const subscription =
        await this.stripeService.retrieveSubscription(subscriptionId);
      const context = subscription.metadata.context;

      if (context === 'customer') {
        const companySubscription =
          await this.companySubscriptionService.findOneByStripeId(
            subscriptionId,
          );

        if (companySubscription) {
          companySubscription.payment_status = 'past_due';
          companySubscription.status = 'past_due';

          await this.companySubscriptionService.update(
            companySubscription.id,
            companySubscription,
          );
          this.logger.log(
            `Suscripción de Empresa ${companySubscription.id} marcada como 'past_due' por pago fallido.`,
          );

          //! Aca podria enviarse un email al customer p[ara avisarle que su pago fallo y si no revierte esto su membresia caducara
        }
      } else if (context === 'client') {
        const membership = await this.dataSource.manager.findOneBy(Membership, {
          stripe_subscription_id: subscriptionId,
        });

        if (membership) {
          const pastDueStatus = await this.dataSource.manager.findOneBy(
            MembershipStatus,
            {
              membershipStatus: 'past_due',
            },
          );

          if (pastDueStatus) {
            membership.status = pastDueStatus;
            await this.dataSource.manager.save(membership);
            this.logger.log(
              `Membresía de Cliente Final ${membership.id} marcada como 'past_due' por pago fallido.`,
            );
          } else {
            this.logger.error(
              "No se encontró el estado 'past_due' en la tabla MembershipStatus.",
            );
          }

          //! Aca podria enviarse un email al cliente p[ara avisarle que su pago fallo y si no revierte esto su membresia caducara
        }
      }
    } catch (error) {
      this.logger.error(
        `Error procesando 'invoice.payment_failed' para la suscripción ${subscriptionId}: ${error.message}`,
        error.stack,
      );
    }
  }

  private async findOrCreateUserByEmail(
    stripeCustomer: Stripe.Customer,
  ): Promise<User> {
    const email = stripeCustomer.email!;
    let user = await this.dataSource.manager.findOne(User, {
      where: { email },
      relations: ['client', 'employee'],
    });

    if (user) return user;

    return this.dataSource.transaction(async (em) => {
      const nameParts = stripeCustomer.name?.split(' ') || [];
      const newUser = em.create(User, {
        email: email,
        first_name: nameParts.shift() || 'Usuario',
        last_name: nameParts.join(' ') || 'Stripe',
        password: 'RandomPassword',
      });
      return em.save(newUser);
    });
  }
}
