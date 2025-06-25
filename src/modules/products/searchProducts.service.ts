import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectTenantRepository } from "src/common/typeorm-tenant-repository/tenant-repository.decorator";
import { Product } from "./entities/product.entity";
import { Repository } from "typeorm";
import { instanceToPlain } from "class-transformer";

@Injectable()
export class ProductSearchService {
  constructor(
    @InjectTenantRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

async searchProducts(query: string, color: string): Promise<any> {
    if (!query || query.trim() === '') {
      throw new BadRequestException('There are no results for your search');
    }

    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subCategory', 'subCategory')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.color', 'color')
      .leftJoinAndSelect('variants.variantSizes', 'variantSizes')
      .leftJoinAndSelect('variantSizes.size', 'size')
      .where('brand.name ILIKE :query', { query: `%${query}%` })
      // .orWhere('product.description ILIKE :query', { query: `%${query}%` })
      // .orWhere('product.code ILIKE :query', { query: `%${query}%` })
      // .orWhere('category.name ILIKE :query', { query: `%${query}%` })
      // .orWhere('subCategory.name ILIKE :query', { query: `%${query}%` })
      // .orWhere('brand.name ILIKE :brand', { brand: `%${query}%` })
      // .orWhere('variants.description ILIKE :query', { query: `%${query}%` })
      .andWhere('color.color ILIKE :color', { color: `%${color}%` })
      // .orWhere('size.size_us::text ILIKE :query', { query: `%${query}%` })
      // .orWhere('size.size_eur::text ILIKE :query', { query: `%${query}%` })
      // .orWhere('size.size_cm::text ILIKE :query', { query: `%${query}%` })
      // .orWhere('product.sale_price::text ILIKE :query', { query: `%${query}%` })
      .take(50)
      .getMany();

    return instanceToPlain(products);
  }
}