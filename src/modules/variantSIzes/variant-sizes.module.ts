import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariantSize } from './entities/variantSizes.entity';
import { Size } from 'src/catalogues/sizeProduct/entities/size-product.entity';
import { ProductVariant } from '../productsVariant/entities/product-variant.entity';
import { VariantSizesService } from './variant-sizes.service';
import { VariantSizesController } from './variant-sizes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VariantSize, Size, ProductVariant])],
  providers: [VariantSizesService],
  controllers: [VariantSizesController],
})
export class VariantSizesModule {}