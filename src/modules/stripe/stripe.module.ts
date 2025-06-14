import { forwardRef, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { OrdersModule } from '../orders/orders.module';
import { SubscriptionsModule } from '../suscriptions/subscriptions.module';

@Module({
  imports: [forwardRef(() => OrdersModule), SubscriptionsModule],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
