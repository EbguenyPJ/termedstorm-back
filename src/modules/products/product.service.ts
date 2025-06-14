import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async saveMany(data: CreateProductDto[]) {
  return this.productRepository.save(data);
}

  async create(createDto: CreateProductDto): Promise<any> {
    const exist = await this.productRepository.findOne({
      where: { code: createDto.code },
    });
    if (exist) {
      throw new BadRequestException(
        `Product with code ${createDto.code} alredy exists`,
      );
    }
    const product = this.productRepository.create({
      ...createDto
  });
    const saved = await this.productRepository.save(product)
    return instanceToPlain(saved);
  }

  async findAll(): Promise<any> {
    const products = await this.productRepository.find({
      relations: ['category', 'subCategory', 'brand'],
    });
    return instanceToPlain(products);
  }

  async findOne(id: string): Promise<any> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'subCategory', 'brand'],
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return instanceToPlain(product);
  }

async update(id: string, updateDto: UpdateProductDto): Promise<{ message: string; updatedProduct: Product }> {
  const product = await this.productRepository.findOneBy({ id });

  if (!product) {
    throw new NotFoundException(`Product with id ${id} not found`);
  }

  const updatedProduct = await this.productRepository.save({ ...product, ...updateDto });

  return {
    message: `Product with id ${id} updated successfully`,
    updatedProduct,
  };
}

  async delete(id: string): Promise<{ message: string }> {
    const exists = await this.productRepository.findOneBy({id});
    if (!exists) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.productRepository.update(id, { deleted_at: new Date() });
    return { message: `Product with ID ${id} deleted successfully` };
  }
}
