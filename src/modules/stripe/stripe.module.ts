import { forwardRef, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { OrdersModule } from '../orders/orders.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { StripeController } from './stripe.controller';

@Module({
  imports: [
    forwardRef(() => OrdersModule),
    forwardRef(() => SubscriptionsModule),
  ],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
