import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SubCategory } from './entities/sub-category.entity';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
  ) {}

  async create(createDto: CreateSubCategoryDto): Promise<SubCategory> {
    const subCategory = this.subCategoryRepository.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
    });
    return this.subCategoryRepository.save(subCategory);
  }

  async findAll(): Promise<SubCategory[]> {
    return this.subCategoryRepository.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<SubCategory> {
    const subCategory = await this.subCategoryRepository.findOne({
      where: { id, isActive: true },
    });
    if (!subCategory)
      throw new NotFoundException(`SubCategory with id ${id} not found`);
    return subCategory;
  }

  async update(
    id: string,
    updateDto: UpdateSubCategoryDto,
  ): Promise<{ message: string }> {
    const exists = await this.subCategoryRepository.findOne({
      where: { id, isActive: true },
    });
    if (!exists)
      throw new NotFoundException(`SubCategory with id ${id} not found`);
    await this.subCategoryRepository.update(id, updateDto);
    return { message: `SubCategory with id ${id} updated successfully` };
  }

  async delete(id: string): Promise<{ message: string }> {
    const exists = await this.subCategoryRepository.findOne({
      where: { id, isActive: true },
    });
    if (!exists)
      throw new NotFoundException(`SubCategory with id ${id} not found`);
    await this.subCategoryRepository.update(id, { isActive: false });
    return { message: `SubCategory with id ${id} deactivated successfully` };
  }
}
