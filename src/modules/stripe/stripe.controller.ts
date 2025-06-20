import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';

import { StripeService } from './stripe.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { OrdersService } from '../orders/orders.service';

@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('webhook')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: Request & { rawBody: Buffer },
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripeService.constructEvent(request.rawBody, signature);
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription') {
          this.logger.log(`Webhook: Checkout de Suscripción completado.`);
          await this.subscriptionsService.handleSubscriptionWebhook(event);
        } else if (session.mode === 'payment') {
          this.logger.log(`Webhook: Checkout de Pago Único completado.`);
          await this.ordersService.createOrderFromStripeSession(session);
        }
        break;
      }

      case 'invoice.paid':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'invoice.payment_failed': {
        this.logger.log(
          `Webhook: Evento de ciclo de vida de suscripción recibido: ${event.type}.`,
        );
        await this.subscriptionsService.handleSubscriptionWebhook(event);
        break;
      }

      default: {
        this.logger.warn(`Webhook: Evento no manejado: ${event.type}`);
      }
    }

    return { received: true };
  }
}
