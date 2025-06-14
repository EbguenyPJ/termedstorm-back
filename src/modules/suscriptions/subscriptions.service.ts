import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { StripeService } from '../stripe/stripe.service';
import { Client } from '../temp-entities/client.placeholder.entity';
import { Membership } from './entities/membership.entity';
import { MembershipType } from './entities/membershipType.entity';
import Stripe from 'stripe';
import { User } from '../temp-entities/users.placeholder.entity';
import { MembershipStatus } from 'src/catalogues/userMembershipStatus/entities/membership-status.entity';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly stripeService: StripeService,
  ) {}

  async createMembership(dto: CreateSubscriptionDto) {
    const { email, name, price_id, payment_method_id } = dto;

    const stripeCustomer = await this.stripeService.findOrCreateCustomer(
      email,
      name,
    );

    try {
      await this.stripeService.attachPaymentMethod(
        stripeCustomer.id,
        payment_method_id,
      );

      await this.stripeService.updateCustomerDefaultPaymentMethod(
        stripeCustomer.id,
        payment_method_id,
      );
    } catch (error) {
      this.logger.error(
        `Error al adjuntar el método de pago ${payment_method_id} al cliente ${stripeCustomer.id}`,
        error.stack,
      );

      throw new NotFoundException(
        `El método de pago proporcionado no es válido o no se pudo adjuntar. Error: ${error.message}`,
      );
    }

    const stripeSubscription = await this.stripeService.createSubscription(
      stripeCustomer.id,
      price_id,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let newMembership: Membership;
    try {
      const client = await this.findOrCreateClient(dto, queryRunner.manager);

      // aca

      const membershipType = await queryRunner.manager.findOneBy(
        MembershipType,
        { stripe_price_id: price_id },
      );

      const initialStatus = await queryRunner.manager.findOneBy(
        MembershipStatus,
        { membershipStatus: 'pending' },
      );

      if (!membershipType || !initialStatus) {
        throw new InternalServerErrorException(
          "Configuración de membresía incompleta (falta tipo o estado 'pending').",
        );
      }

      newMembership = queryRunner.manager.create(Membership, {
        client,
        type: membershipType,
        status: initialStatus,
        stripeCustomerId: stripeCustomer.id,
        stripe_subscription_id: stripeSubscription.id,
      });
      await queryRunner.manager.save(newMembership);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error al crear membresía local', error.stack);

      await this.stripeService.cancelSubscription(stripeSubscription.id);
      this.logger.warn(
        `Suscripción ${stripeSubscription.id} cancelada debido a un error en la BD.`,
      );

      throw error;
    } finally {
      await queryRunner.release();
    }
    type InvoiceWithExpandedPaymentIntent = Stripe.Invoice & {
      payment_intent: Stripe.PaymentIntent | null;
    };
    const latestInvoice =
      stripeSubscription.latest_invoice as InvoiceWithExpandedPaymentIntent | null;
    const clientSecret = latestInvoice?.payment_intent?.client_secret ?? null;

    if (!clientSecret) {
      this.logger.warn(
        `No se generó un client_secret para la suscripción ${stripeSubscription.id}. Esto es normal en periodos de prueba.`,
      );
    }

    return {
      message: 'Suscripción creada exitosamente.',
      subscriptionId: stripeSubscription.id,
      status: stripeSubscription.status,
      clientSecret: clientSecret,
    };
  }

  private async findOrCreateClient(
    dto: CreateSubscriptionDto,
    manager: EntityManager,
  ): Promise<Client> {
    const user = await manager.findOne(User, {
      where: { email: dto.email },
      relations: { client: true },
    });

    if (user) {
      if (user.client) {
        this.logger.log(`Cliente encontrado para el usuario ${user.email}.`);
        return user.client;
      } else {
        this.logger.log(
          `Usuario ${user.email} encontrado. Creando perfil de cliente...`,
        );
        const newClient = manager.create(Client, {
          user: user,
          isPremium: false,
        });
        return manager.save(newClient);
      }
    } else {
      this.logger.log(
        `Usuario no encontrado para ${dto.email}. Creando nuevo usuario y cliente...`,
      );

      const newUser = manager.create(User, {
        email: dto.email,
        firstName: dto.name,
        lastName: '',
      });
      await manager.save(newUser);

      const newClient = manager.create(Client, {
        user: newUser,
        isPremium: false,
      });
      return manager.save(newClient);
    }
  }

  async handleSuccessfulPayment(invoice: Stripe.Invoice) {
    const subscriptionId = invoice['subscription'] as string;
    if (!subscriptionId) return;

    const stripeSubscription =
      await this.stripeService.retrieveSubscription(subscriptionId);

    const membershipRepo = this.dataSource.getRepository(Membership);
    const membership = await membershipRepo.findOne({
      where: { stripe_subscription_id: subscriptionId },
      relations: ['status'],
    });

    if (!membership) {
      this.logger.error(
        `Membresía no encontrada para stripeSubscriptionId: ${subscriptionId}`,
      );
      return;
    }

    const activeStatus = await this.dataSource
      .getRepository(MembershipStatus)
      .findOneBy({ membershipStatus: 'active' });
    if (!activeStatus)
      throw new InternalServerErrorException(
        "Estado 'active' no encontrado en la base de datos.",
      );

    membership.status = activeStatus;

    const creationDate = new Date(
      stripeSubscription['current_period_start'] * 1000,
    );
    const expirationDate = new Date(
      stripeSubscription['current_period_end'] * 1000,
    );

    if (!membership.creation_date) {
      membership.creation_date = creationDate.toISOString().split('T')[0];
    }
    membership.expiration_date = expirationDate.toISOString().split('T')[0];

    await membershipRepo.save(membership);
    this.logger.log(
      `Membresía ${membership.id} actualizada a estado 'active'. Válida hasta: ${membership.expiration_date}`,
    );
  }

  async handleSubscriptionPaymentFailure(invoice: Stripe.Invoice) {
    const subscriptionId = invoice['subscription'] as string;
    if (!subscriptionId) return;

    const membershipRepo = this.dataSource.getRepository(Membership);
    const membership = await membershipRepo.findOne({
      where: { stripe_subscription_id: subscriptionId },
    });
    if (!membership) {
      this.logger.warn(
        `Fallo de pago para una membresía no encontrada en la BD: ${subscriptionId}`,
      );
      return;
    }

    const pastDueStatus = await this.dataSource
      .getRepository(MembershipStatus)
      .findOneBy({ membershipStatus: 'past_due' });
    if (!pastDueStatus)
      throw new InternalServerErrorException(
        "Estado 'past_due' no encontrado en la base de datos.",
      );

    membership.status = pastDueStatus;
    await membershipRepo.save(membership);

    this.logger.warn(
      `Falló el pago para la membresía ${membership.id}. Estado cambiado a 'past_due'.`,
    );
  }

  async isMembershipActive(clientId: string): Promise<boolean> {
    const membership = await this.dataSource.getRepository(Membership).findOne({
      where: { client: { id: clientId } },
      relations: ['status'],
      order: { updated_at: 'DESC' },
    });

    if (!membership || !membership.status) {
      return false;
    }

    return membership.status.membershipStatus === 'active';
  }
}

//esto va donde dice 'aca'
// let client = await queryRunner.manager.findOne(Client, {
//   where: { user: { email } },
//   relations: ['user'],
// });
// if (!client) {
//   const user = queryRunner.manager.create(User, {
//     email,
//     name,
//   });
//   await queryRunner.manager.save(user);

//   client = queryRunner.manager.create(Client, {
//     user: user,
//     //  membership: membership,
//   });
// }

// await queryRunner.manager.save(client);

//

//

// import { Injectable, NotFoundException, Logger } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Client } from '../temp-entities/client.placeholder.entity';
// import { StripeService } from '../stripe/stripe.service';
// import { CreateSubscriptionDto } from './dto/create-subscription.dto';
// import Stripe from 'stripe';

// @Injectable()
// export class SubscriptionsService {
//   private readonly logger = new Logger(SubscriptionsService.name);

//   constructor(
//     @InjectRepository(Client)
//     private readonly clientRepository: Repository<Client>,
//     private readonly stripeService: StripeService,
//   ) {}

//   async createMembership(dto: CreateSubscriptionDto) {
//     const { email, name, priceId, paymentMethodId } = dto;

//     const stripeCustomer = await this.stripeService.findOrCreateCustomer(
//       email,
//       name,
//       paymentMethodId,
//     );
//     await this.stripeService.attachPaymentMethod(
//       stripeCustomer.id,
//       paymentMethodId,
//     );

//     let client = await this.clientRepository.findOne({ where: { email } });
//     if (!client) {
//       client = this.clientRepository.create({
//         email,
//         name,
//         stripeCustomerId: stripeCustomer.id,
//       });
//     } else {
//       client.stripeCustomerId = stripeCustomer.id;
//     }

//     await this.clientRepository.save(client);

//     const subscription = await this.stripeService.createSubscription(
//       stripeCustomer.id,
//       priceId,
//       paymentMethodId,
//     );

//     client.stripeSubscriptionId = subscription.id;
//     client.subscriptionStatus = subscription.status;
//     await this.clientRepository.save(client);

//     this.logger.log(
//       `Iniciada suscripción ${subscription.id} para el cliente ${client.id}`,
//     );
//     const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
//     const paymentIntent = latestInvoice
//       ? (latestInvoice['payment_intent'] as Stripe.PaymentIntent)
//       : null;
//     return {
//       subscriptionId: subscription.id,
//       status: subscription.status,
//       clientSecret: paymentIntent?.client_secret || null,
//     };
//   }

//   async handleSubscriptionPaid(invoice: Stripe.Invoice) {
//     const customerId = invoice.customer as string;
//     const subscriptionId = invoice['subscription'] as string;

//     if (!customerId || !subscriptionId) {
//       this.logger.error(
//         'Webhook de invoice.paid recibido sin customerId o subscriptionId.',
//       );
//       return;
//     }

//     const client = await this.clientRepository.findOne({
//       where: { stripeCustomerId: customerId },
//     });

//     if (!client) {
//       this.logger.error(
//         `No se encontró un cliente con el stripeCustomerId: ${customerId}`,
//       );
//       return;
//     }

//     client.subscriptionStatus = 'active';
//     client.stripeSubscriptionId = subscriptionId;
//     await this.clientRepository.save(client);

//     this.logger.log(
//       `Suscripción ${subscriptionId} marcada como 'activa' para el cliente ${client.id}`,
//     );
//   }

//   async handleSubscriptionFailed(invoice: Stripe.Invoice) {
//     const customerId = invoice.customer as string;
//     const subscriptionId = invoice['subscription'] as string;

//     if (!customerId || !subscriptionId) {
//       this.logger.error(
//         'Webhook de invoice.payment_failed recibido sin customerId o subscriptionId.',
//       );
//       return;
//     }

//     const client = await this.clientRepository.findOne({
//       where: { stripeCustomerId: customerId },
//     });

//     if (!client) {
//       this.logger.error(
//         `No se encontró un cliente con el stripeCustomerId: ${customerId}`,
//       );
//       return;
//     }

//     client.subscriptionStatus = 'past_due';
//     await this.clientRepository.save(client);

//     this.logger.warn(
//       `El pago de la suscripción ${subscriptionId} falló. Cliente ${client.id} marcado como 'past_due'.`,
//     );
//   }
// }
