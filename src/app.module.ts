import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodosModule } from './modules/todos/todos.module';
import { MembershipStatusModule } from './catalogues/userMembershipStatus/membership-status.module';
import { SubCategoryModule } from './catalogues/subCategory/sub-category.module';
import { PaymentMethodModule } from './catalogues/paymentMethod/payment-method.module';
import { GenderModule } from './catalogues/gender/gender.module';
import { CategoryModule } from './catalogues/category/category.module';
import { CancelReasonModule } from './catalogues/cancelReason/cancel-reason.module';
import { BrandModule } from './catalogues/brand/brand.module';
import { ProductModule } from './modules/products/product.module';
import { CsvUploadModule } from './modules/csvUpload/csv-upload.module';
import { ProductVariant } from './modules/productsVariant/entities/product-variant.entity';
import { ProductModification } from './modules/productModification/entities/product-modification.entity';

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
    MembershipStatusModule,
    SubCategoryModule,
    PaymentMethodModule,
    GenderModule,
    CategoryModule,
    CancelReasonModule,
    BrandModule,
    ProductModule,
    ProductVariant,
    ProductModification,
    CsvUploadModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
