import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { Size } from '../../catalogues/sizeProduct/entities/size-product.entity';
import { Product } from '../products/entities/product.entity';
import { instanceToPlain } from 'class-transformer';
import { VariantSize } from '../variantSIzes/entities/variantSizes.entity';
import { Color } from 'src/catalogues/colorProduct/entities/colorProduct.entity';
import { VariantSizesService } from '../variantSIzes/variant-sizes.service';

@Injectable()
export class ProductVariantService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
    @InjectRepository(Size)
    private readonly sizeRepository: Repository<Size>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(VariantSize)
    private readonly variantSizeRepository: Repository<VariantSize>,
    private readonly variantSizeService: VariantSizesService,
  ) {}

async create(
  createDto: CreateProductVariantDto,
  productArg?: Product,
  manager?: EntityManager,
): Promise<any> {
  const { variantSizes = [], color_id, product_id, ...rest } = createDto;

    const product = productArg
    ? productArg
    : product_id
      ? manager
      ? await manager.findOneBy(Product, { id: product_id })
      : await this.productRepository.findOneBy({ id: product_id })
    : null;

  if (!product) throw new NotFoundException(`Product with id ${product_id} not found`);

   const color = manager
    ? await manager.findOneBy(Color, { id: color_id })
    : await this.colorRepository.findOneBy({ id: color_id });
  if (!color) throw new NotFoundException(`Color with id ${color_id} not found`);

    const variant = manager
    ? manager.create(ProductVariant, { ...rest, product, color })
    : this.variantRepository.create({ ...rest, product, color });

  const savedVariant = manager
    ? await manager.save(variant)
    : await this.variantRepository.save(variant);

      if (variantSizes.length > 0) {
    for (const sizeDto of variantSizes) {
      await this.variantSizeService.create(sizeDto, savedVariant, manager);
    }
  }

  const fullVariant = manager
    ? await manager.findOne(ProductVariant, {
        where: { id: savedVariant.id },
        relations: ['product', 'color', 'variantSizes', 'variantSizes.size'],
      })
    : await this.variantRepository.findOne({
        where: { id: savedVariant.id },
        relations: ['product', 'color', 'variantSizes', 'variantSizes.size'],
      });

  return instanceToPlain(fullVariant);
}


  async findAll(): Promise<any> {
    const productVariants = await this.variantRepository.find({
      relations: ['variantSizes'],
    });
    return instanceToPlain(productVariants);
  }

  async findOne(id: string): Promise<any> {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: ['product', 'color', 'variantSizes', 'variantSizes.size'],
    });
    if (!variant)
      throw new NotFoundException(`Variant with ID ${id} not found`);
    return instanceToPlain(variant);
  }

  async update(
    id: string,
    updateDto: UpdateProductVariantDto,
  ): Promise<{ message: string }> {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: ['product', 'color', 'variantSizes', 'variantSizes.size'],
    });

    if (!variant) {
      throw new NotFoundException(`Variant with ID ${id} not found`);
    }

    const { color_id, product_id, variantSizes = [] } = updateDto;

    if (variantSizes.length > 0 && (color_id || product_id)) {
      const existingVariants = await this.variantRepository.find({
        where: {
          product: { id: product_id ?? variant.product.id },
          color: { id: color_id ?? variant.color.id },
        },
        relations: ['variantSizes', 'variantSizes.size'],
      });

      for (const existing of existingVariants) {
        if (existing.id === variant.id) continue;

        for (const existingVs of existing.variantSizes) {
          for (const incomingVs of variantSizes) {
            if (existingVs.size.id === incomingVs.size_id) {
              throw new BadRequestException(
                `Ya existe otra variante con esta talla (size_id=${incomingVs.size_id}) y este color (${color_id ?? variant.color.id}) para el producto`,
              );
            }
          }
        }
      }
    }
    await this.variantRepository.update(id, {
      ...variant,
      ...updateDto,
    });

    if (variantSizes.length > 0) {
      await this.variantSizeRepository.delete({ variantProduct: { id } });
      const variantSizeEntities = await Promise.all(
        variantSizes.map(async ({ size_id, stock }) => {
          const size = await this.sizeRepository.findOne({
            where: { id: size_id },
          });
          if (!size) {
            throw new NotFoundException(`Size with ID ${size_id} not found`);
          }

          return this.variantSizeRepository.create({
            size,
            stock,
            variantProduct: { id } as any,
          });
        }),
      );

      await this.variantSizeRepository.save(variantSizeEntities);
    }

    return { message: `Variant with ID ${id} updated successfully` };
  }

  async delete(id: string): Promise<{ message: string }> {
    const exists = await this.variantRepository.findOneBy({ id });
    if (!exists) {
      throw new NotFoundException(`Variant with ID ${id} not found`);
    }
    await this.variantRepository.update(id, { deleted_at: new Date() });
    return { message: `Variant with ID ${id} deleted successfully` };
  }
}
