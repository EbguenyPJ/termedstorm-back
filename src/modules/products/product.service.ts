import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductVariant } from '../productsVariant/entities/product-variant.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
  ) {}

  async saveMany(data: CreateProductDto[]) {
    return this.productRepository.save(data);
  }

  async create(createDto: CreateProductDto): Promise<Product> {
    const exist = await this.productRepository.findOne({
      where: { id: createDto.id },
    });
    if (exist) {
      throw new BadRequestException(
        `Product with id ${createDto.id} alredy exists`,
      );
    }
    const product = this.productRepository.create(createDto);
    return this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['category', 'subCategory', 'brand'],
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'subCategory', 'brand'],
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(
    id: string,
    updateDto: UpdateProductDto,
  ): Promise<{ message: string; updatedProduct: Product }> {
    const product = await this.productRepository.preload({ id, ...updateDto });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const updatedProduct = await this.productRepository.save(product);

    return {
      message: `Product with id ${id} updated successfully`,
      updatedProduct,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.findOne(id);
    await this.productRepository.delete(product.id);
    return { message: `Product with id ${id} deleted successfully` };
  }

  async findManyVariantsByIds(ids: string[]): Promise<ProductVariant[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    return this.productVariantRepository.find({
      where: {
        id: In(ids),
      },
      relations: {
        product: true,
      },
    });
  }
}
