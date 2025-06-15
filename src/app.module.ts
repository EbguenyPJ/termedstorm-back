import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodosModule } from './modules/todos/todos.module';
import { AuditModule } from './modules/audits/audit.module';
import { CutModule } from './modules/cuts/cut.module';<<<<<<< HEAD
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { UsersModule } from './modules/users/users.module';
=======
import { MembershipStatusModule } from './catalogues/userMembershipStatus/membership-status.module';
import { SubCategoryModule } from './catalogues/subCategory/sub-category.module';
import { PaymentMethodModule } from './catalogues/paymentMethod/payment-method.module';
import { CategoryModule } from './catalogues/category/category.module';
import { CancelReasonModule } from './catalogues/cancelReason/cancel-reason.module';
import { BrandModule } from './catalogues/brand/brand.module';
import { ProductModule } from './modules/products/product.module';
import { CsvUploadModule } from './modules/csvUpload/csv-upload.module';
import { ProductVariantModule } from './modules/productsVariant/product-variant.module';
import { AuditModule } from './modules/auditModification/audit.module';
import { SizeModule } from './modules/sizeProduct/size-product.module';

>>>>>>> cd8e4efefb8e00c312b3b8229db8eb2d2494dd20

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
<<<<<<< HEAD
    AuthModule,
    RolesModule,
    EmployeesModule,
    UsersModule,
=======
    MembershipStatusModule,
    SubCategoryModule,
    PaymentMethodModule,
    CategoryModule,
    CancelReasonModule,
    BrandModule,
    ProductModule,
    CsvUploadModule,
    ProductVariantModule,
    AuditModule,
    SizeModule
>>>>>>> cd8e4efefb8e00c312b3b8229db8eb2d2494dd20
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
