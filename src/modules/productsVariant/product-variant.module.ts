import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductVariantService } from './product-variant.service';
import { ProductVariantController } from './product-variant.controller';
import { Size } from '../../catalogues/sizeProduct/entities/size-product.entity';
import { Product } from '../products/entities/product.entity';
import { VariantSize } from '../variantSIzes/entities/variantSizes.entity';
import { Color } from 'src/catalogues/colorProduct/entities/colorProduct.entity';
import { VariantSizesService } from '../variantSIzes/variant-sizes.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductVariant, Size, Color, Product, VariantSize])],
  controllers: [ProductVariantController],
  providers: [ProductVariantService, VariantSizesService],
  exports: [ProductVariantService]
})
export class ProductVariantModule {}
