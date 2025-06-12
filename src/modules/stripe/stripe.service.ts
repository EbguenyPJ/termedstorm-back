import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!secretKey) {
      throw new Error(
        'La clave secreta de Stripe (STRIPE_SECRET_KEY) no está configurada.',
      );
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-05-28.basil',
    });
  }

  async createCheckoutSession(
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
    metadata: Stripe.MetadataParam,
    successUrl: string,
    cancelUrl: string,
  ) {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      metadata: metadata,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    paymentMethodId: string,
  ) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        default_payment_method: paymentMethodId,
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      return subscription;
    } catch (error) {
      this.logger.error(
        `Error al crear la suscripción en Stripe: ${error.message}`,
      );
      throw new BadRequestException(error.message);
    }
  }

  async findOrCreateCustomer(
    email: string,
    name: string,
    paymentMethodId: string,
  ) {
    const customers = await this.stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      const customer = customers.data[0];
      await this.attachPaymentMethod(customer.id, paymentMethodId);
      return customer;
    }

    const customer = await this.stripe.customers.create({
      email: email,
      name: name,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    return customer;
  }

  constructEvent(body: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      this.logger.error(
        'El secreto del webhook de Stripe (STRIPE_WEBHOOK_SECRET) no está configurado.',
      );
      throw new Error(
        'La configuración del servidor está incompleta: falta el secreto del webhook de Stripe.',
      );
    }
    return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }

  async attachPaymentMethod(customerId: string, paymentMethodId: string) {
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    await this.stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  }
}
