import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { TenantConnectionService } from 'src/common/tenant-connection/tenant-connection.service';

@Injectable()
export class CategoryService {
  constructor(
    // // @InjectRepository(Category)
    // private readonly categoryRepository: Repository<Category>,
    private readonly tenantConnectionService: TenantConnectionService,
  ) {}

  private getCategoryRepository(): Repository<Category> {
    const dataSource =
      this.tenantConnectionService.getTenantDataSourceFromContext();
    return dataSource.getRepository(Category);
  }
  
  async create(createDto: CreateCategoryDto): Promise<any> {
    const categoryRepository = this.getCategoryRepository();
   
    const { name, key } = createDto;

    const existing = await categoryRepository.findOne({
      where: [{ name }, { key }],
    });

    if (existing) {
      throw new BadRequestException(
        `Category already exists with ${
          existing.name === name ? 'name' : 'key'
        }: ${existing.name === name ? name : key}`,
      );
    }
    const category = categoryRepository.create({
      ...createDto,
    });
const saved = await categoryRepository.save(category)
    return instanceToPlain(saved);
  }

  async findAll(): Promise<any> {
    const categoryRepository = this.getCategoryRepository();
    const categories = await categoryRepository.find({
      relations: {
        subcategories: true,
      },
    });
  return instanceToPlain(categories);
}

async findOne(id: string): Promise<any> {
  const categoryRepository = this.getCategoryRepository();
  const category = await categoryRepository.findOne({
      where: { id },
      relations: {
        subcategories: true,
      },
    });

  if (!category) {
    throw new NotFoundException(`Category with id ${id} not found`);
  }

  return instanceToPlain(category);
}

  async update(
    id: string,
    updateDto: UpdateCategoryDto,
  ): Promise<{ message: string }> {
    const categoryRepository = this.getCategoryRepository();
    const exists = await categoryRepository.findOne({
    where: { id },
  });
    if (!exists)
      throw new NotFoundException(`Category with id ${id} not found`);
    await categoryRepository.update(id, updateDto);
    return { message: `Category with id ${id} updated successfully` };
  }

  async delete(id: string): Promise<{ message: string }> {
    const categoryRepository = this.getCategoryRepository();
    const exists = await categoryRepository.findOne({
    where: { id },
  });
    if (!exists)
      throw new NotFoundException(`Category with id ${id} not found`);
    await categoryRepository.softDelete(id);
    return { message: `Category with id ${id} deactivated successfully` };
  }
}
