import { forwardRef, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { OrdersModule } from '../orders/orders.module';
import { StripeWebhookController } from './stripe.webhook.controller';
import { SubscriptionsModule } from '../suscriptions/subscriptions.module';

@Module({
  imports: [forwardRef(() => OrdersModule), SubscriptionsModule],
  providers: [StripeService],
  controllers: [StripeWebhookController],
  exports: [StripeService],
})
export class StripeModule {}
