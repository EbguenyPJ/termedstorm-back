import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>) {}

  async create(createDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
    });
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, isActive: true },
    });
    if (!category)
      throw new NotFoundException(`Category with id ${id} not found`);
    return category;
  }

  async update(
    id: string,
    updateDto: UpdateCategoryDto,
  ): Promise<{ message: string }> {
    const exists = await this.categoryRepository.findOne({
      where: { id, isActive: true },
    });
    if (!exists)
      throw new NotFoundException(`Category with id ${id} not found`);
    await this.categoryRepository.update(id, updateDto);
    return { message: `Category with id ${id} updated successfully` };
  }

  async delete(id: string): Promise<{ message: string }> {
    const exists = await this.categoryRepository.findOne({
      where: { id, isActive: true },
    });
    if (!exists)
      throw new NotFoundException(`Category with id ${id} not found`);
    await this.categoryRepository.update(id, { isActive: false });
    return { message: `Category with id ${id} deactivated successfully` };
  }
}
