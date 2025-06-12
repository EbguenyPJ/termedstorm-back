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
import { OrdersService } from '../orders/orders.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Controller('stripe-webhook')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly ordersService: OrdersService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: Request & { rawBody: Buffer },
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripeService.constructEvent(request.rawBody, signature);
    } catch (err) {
      this.logger.error(
        `Error al verificar la firma del webhook: ${err.message}`,
      );
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Webhook recibido: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        this.logger.log(`Procesando pago único para la sesión: ${session.id}`);

        await this.ordersService.fulfillOrder(session);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        this.logger.log(
          `Factura de suscripción pagada: ${invoice.id}, para el cliente: ${invoice.customer}`,
        );

        await this.subscriptionsService.handleSubscriptionPaid(invoice);
        // en esta parte deberiamos maracr como activa la suscripcion en la bd. Como hacerlo?
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        this.logger.error(
          `Falló el pago de la factura: ${invoice.id}, para el cliente: ${invoice.customer}`,
        );

        await this.subscriptionsService.handleSubscriptionFailed(invoice);
        // aca marcaariamos como membresia impaga en bd
        break;
      }

      default:
        this.logger.warn(`Evento de webhook no manejado: ${event.type}`);
    }

    return { received: true };
  }
}
