import { forwardRef, Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { StripeModule } from '../stripe/stripe.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../users/entities/client.entity';
import { MasterDataModule } from 'src/master_data/master_data.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]),
    forwardRef(() => StripeModule),
    MasterDataModule,
  ],
  providers: [SubscriptionsService],
  controllers: [SubscriptionsController],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
