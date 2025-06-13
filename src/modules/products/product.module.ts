import { Module } from '@nestjs/common';
import { ProductService } from '../products/product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from 'src/catalogues/category/entities/category.entity';
import { SubCategory } from 'src/catalogues/subCategory/entities/sub-category.entity';
import { Brand } from 'src/catalogues/brand/entities/brand.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, SubCategory, Brand])],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService]
})
export class ProductModule {}
