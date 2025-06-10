import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodosModule } from './modules/todos/todos.module';
import { UserTypeModule } from './catalogues/userTypes/user-types.module';
import { MembershipStatusModule } from './catalogues/userMembershipStatus/membership-status.module';
import { SubCategoryModule } from './catalogues/subCategory/sub-category.module';
import { PaymentMethodModule } from './catalogues/paymentMethod/payment-method.module';
import { GenderModule } from './catalogues/gender/gender.module';
import { CategoryModule } from './catalogues/category/category.module';
import { CancelReasonModule } from './catalogues/cancelReason/cancel-reason.module';
import { BrandModule } from './catalogues/brand/brand.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('typeorm')!,
    }),
    TodosModule,
    UserTypeModule,
    MembershipStatusModule,
    SubCategoryModule,
    PaymentMethodModule,
    GenderModule,
    CategoryModule,
    CancelReasonModule,
    BrandModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
