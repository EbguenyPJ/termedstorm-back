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
import { CompanySubscriptionService } from 'src/master_data/company_subscription/company-subscription.service';

@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly ordersService: OrdersService,
    private readonly companySubscriptionService: CompanySubscriptionService,
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

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === 'payment') {
        this.logger.log(`Webhook: Checkout de Pago Único completado.`);
        await this.ordersService.createOrderFromStripeSession(session);
        return { received: true };
      }
    }

    try {
      const context = await this.getEventContext(event);

      if (context === 'customer') {
        await this.companySubscriptionService.handleCompanyWebhook(event);
      } else if (context === 'client') {
        await this.subscriptionsService.handleClientWebhook(event);
      } else {
        this.logger.warn(
          `Webhook de tipo ${event.type} recibido sin un contexto claro o relevante. No se puede procesar.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error al procesar el contexto del evento ${event.id}: ${error.message}`,
        error.stack,
      );
    }

    return { received: true };
  }

  private async getEventContext(event: Stripe.Event): Promise<string | null> {
    if (event.type === 'checkout.session.completed') {
      return (
        (event.data.object as Stripe.Checkout.Session).metadata?.context ?? null
      );
    }
    const subscriptionId = (event.data.object as any).subscription;
    if (subscriptionId && typeof subscriptionId === 'string') {
      const subscription =
        await this.stripeService.retrieveSubscription(subscriptionId);
      return subscription.metadata.context ?? null;
    }
    if ((event.data.object as any).object === 'subscription') {
      return (
        (event.data.object as Stripe.Subscription).metadata.context ?? null
      );
    }

    return null;
  }
}
