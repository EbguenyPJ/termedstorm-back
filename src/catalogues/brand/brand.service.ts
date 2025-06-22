import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { In, Repository, DataSource } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { SubCategory } from '../subCategory/entities/sub-category.entity';
import { TenantConnectionService } from 'src/common/tenant-connection/tenant-connection.service';

@Injectable()
export class BrandService {
  constructor(
    //   @InjectRepository(Brand) private readonly brandRepository: Repository<Brand>,
    //   @InjectRepository(SubCategory)
    // private readonly subCategoryRepository: Repository<SubCategory>,
    private readonly tenantConnectionService: TenantConnectionService,
  ) {}

  private getBrandRepository(): Repository<Brand> {
    const dataSource =
      this.tenantConnectionService.getTenantDataSourceFromContext();
    return dataSource.getRepository(Brand);
  }

  private getSubCategoryRepository(): Repository<SubCategory> {
    const dataSource =
      this.tenantConnectionService.getTenantDataSourceFromContext();
    return dataSource.getRepository(SubCategory);
  }

  async create(createDto: CreateBrandDto): Promise<any> {
    const brandRepository = this.getBrandRepository();
    const subCategoryRepository = this.getSubCategoryRepository();

    const { name, key, subcategories } = createDto;

    const existing = await brandRepository.findOne({
      where: [{ name }, { key }],
    });

    if (existing) {
      throw new BadRequestException(
        `Brand already exists with ${
          existing.name === name ? 'name' : 'key'
        }: ${existing.name === name ? name : key}`,
      );
    }

    const duplicateSubCategoryIds = subcategories.filter(
      (id, i, arr) => arr.indexOf(id) !== i,
    );
    if (duplicateSubCategoryIds.length) {
      throw new BadRequestException(`Duplicated SubCategory IDs`);
    }

    const existingSubCategories = await subCategoryRepository.find({
      where: { id: In(subcategories) },
    });

    if (existingSubCategories.length !== subcategories.length) {
      const missing = subcategories.filter(
        (id) => !existingSubCategories.find((sc) => sc.id === id),
      );
      throw new NotFoundException(
        `SubCategories not found: ${missing.join(', ')}`,
      );
    }

    const brand = brandRepository.create({
      ...createDto,
      subcategories: existingSubCategories,
    });
    const saved = await brandRepository.save(brand);
    return instanceToPlain(saved);
  }

  async findAll(): Promise<any> {
    const brandRepository = this.getBrandRepository();

    const brands = await brandRepository.find({
      relations: {
        subcategories: true,
      },
    });
    return instanceToPlain(brands);
  }

  async findOne(id: string): Promise<any> {
    const brandRepository = this.getBrandRepository();
    const brand = await brandRepository.findOne({
      where: { id },
      relations: {
        subcategories: true,
      },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with id ${id} not found`);
    }

    return instanceToPlain(brand);
  }

  async update(
    id: string,
    updateDto: UpdateBrandDto,
  ): Promise<{ message: string }> {
    const brandRepository = this.getBrandRepository();
    const exists = await brandRepository.findOne({
      where: { id },
    });
    if (!exists) throw new NotFoundException(`Brand with id ${id} not found`);
    await brandRepository.update(id, updateDto);
    return { message: `Brand with id ${id} updated successfully` };
  }

  async delete(id: string): Promise<{ message: string }> {
    const brandRepository = this.getBrandRepository();

    const exists = await brandRepository.findOne({
      where: { id },
    });
    if (!exists) throw new NotFoundException(`Brand with id ${id} not found`);
    await brandRepository.softDelete(id);
    return { message: `Brand with id ${id} deactivated successfully` };
  }
}
