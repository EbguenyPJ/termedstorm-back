import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Injectable()
export class ProductVariantService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
  ) {}

  async create(dto: CreateProductVariantDto): Promise<ProductVariant> {
    const variant = this.variantRepository.create({
      ...dto,
      product: { id: dto.product_id_relation } as any,
    });
    return this.variantRepository.save(variant);
  }

  findAll(): Promise<ProductVariant[]> {
    return this.variantRepository.find({ relations: ['product'] });
  }

  async findOne(id: string): Promise<ProductVariant> {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!variant) throw new NotFoundException(`Variant with ID ${id} not found`);
    return variant;
  }

  async update(id: string, updateDto: UpdateProductVariantDto): Promise<{ message: string }> {
    const exists = await this.variantRepository.findOneBy({id});
    if (!exists) {
      throw new NotFoundException(`Variant with ID ${id} not found`);
    }
    await this.variantRepository.update(id, {
      ...updateDto,
      product: updateDto.product_id_relation ? { id: updateDto.product_id_relation } as any : exists.product,
    });
    return { message: `Variant with ID ${id} updated successfully` };
  }

  async delete(id: string): Promise<{ message: string }> {
    const exists = await this.variantRepository.findOneBy({id});
    if (!exists) {
      throw new NotFoundException(`Variant with ID ${id} not found`);
    }
    await this.variantRepository.update(id, { deleted_at: new Date() });
    return { message: `Variant with ID ${id} deleted successfully` };
  }
}
