import { forwardRef, Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { StripeModule } from '../stripe/stripe.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderDetail } from './entities/orderDetail.entity';
import { ProductModule } from '../products/product.module';
import { TypeOfPayment } from '../type-of-payment/type-of-payment.entity';
import { CancellationModule } from '../cancellation/cancellation.module';
import { CancellationService } from '../cancellation/cancellation.service';

@Module({
  imports: [
    forwardRef(() => StripeModule),
    TypeOrmModule.forFeature([Order, OrderDetail, TypeOfPayment]),
    SubscriptionsModule,
    ProductModule,
    CancellationModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
