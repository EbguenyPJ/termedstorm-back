import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service'; 
import { CheckoutController } from './checkout.controller'; 
import { TenantTypeOrmModule } from 'src/common/typeorm-tenant-repository/tenant-repository.provider'; 
import { Order } from 'src/modules/orders/entities/order.entity';
import { OrderDetail } from 'src/modules/orders/entities/orderDetail.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TenantTypeOrmModule.forFeature([Order, OrderDetail, Product])],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}