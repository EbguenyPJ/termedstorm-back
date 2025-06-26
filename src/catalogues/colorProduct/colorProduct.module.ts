import { Module } from '@nestjs/common';
//import { TypeOrmModule } from '@nestjs/typeorm';
import { Color } from './entities/colorProduct.entity';
import { ColorService } from './colorProduct.service';
import { ColorController } from './colorPorduct.controller';
import { TenantTypeOrmModule } from 'src/common/typeorm-tenant-repository/tenant-repository.provider';

@Module({
  imports: [TenantTypeOrmModule.forFeature([Color])],
  providers: [ColorService],
  controllers: [ColorController],
  exports: [ColorService],
})
export class ColorModule {}
