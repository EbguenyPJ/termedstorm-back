import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../temp-entities/client.placeholder.entity';
import { StripeService } from '../stripe/stripe.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly stripeService: StripeService,
  ) {}

  async createMembership(dto: CreateSubscriptionDto) {
    const { email, name, priceId, paymentMethodId } = dto;

    const stripeCustomer = await this.stripeService.findOrCreateCustomer(
      email,
      name,
      paymentMethodId,
    );
    await this.stripeService.attachPaymentMethod(
      stripeCustomer.id,
      paymentMethodId,
    );

    let client = await this.clientRepository.findOne({ where: { email } });
    if (!client) {
      client = this.clientRepository.create({
        email,
        name,
        stripeCustomerId: stripeCustomer.id,
      });
    } else {
      client.stripeCustomerId = stripeCustomer.id;
    }

    await this.clientRepository.save(client);

    const subscription = await this.stripeService.createSubscription(
      stripeCustomer.id,
      priceId,
      paymentMethodId,
    );

    client.stripeSubscriptionId = subscription.id;
    client.subscriptionStatus = subscription.status;
    await this.clientRepository.save(client);

    this.logger.log(
      `Iniciada suscripción ${subscription.id} para el cliente ${client.id}`,
    );
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = latestInvoice
      ? (latestInvoice['payment_intent'] as Stripe.PaymentIntent)
      : null;
    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret: paymentIntent?.client_secret || null,
    };
  }

  async handleSubscriptionPaid(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const subscriptionId = invoice['subscription'] as string;

    if (!customerId || !subscriptionId) {
      this.logger.error(
        'Webhook de invoice.paid recibido sin customerId o subscriptionId.',
      );
      return;
    }

    const client = await this.clientRepository.findOne({
      where: { stripeCustomerId: customerId },
    });

    if (!client) {
      this.logger.error(
        `No se encontró un cliente con el stripeCustomerId: ${customerId}`,
      );
      return;
    }

    client.subscriptionStatus = 'active';
    client.stripeSubscriptionId = subscriptionId;
    await this.clientRepository.save(client);

    this.logger.log(
      `Suscripción ${subscriptionId} marcada como 'activa' para el cliente ${client.id}`,
    );
  }

  async handleSubscriptionFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const subscriptionId = invoice['subscription'] as string;

    if (!customerId || !subscriptionId) {
      this.logger.error(
        'Webhook de invoice.payment_failed recibido sin customerId o subscriptionId.',
      );
      return;
    }

    const client = await this.clientRepository.findOne({
      where: { stripeCustomerId: customerId },
    });

    if (!client) {
      this.logger.error(
        `No se encontró un cliente con el stripeCustomerId: ${customerId}`,
      );
      return;
    }

    client.subscriptionStatus = 'past_due';
    await this.clientRepository.save(client);

    this.logger.warn(
      `El pago de la suscripción ${subscriptionId} falló. Cliente ${client.id} marcado como 'past_due'.`,
    );
  }
}
