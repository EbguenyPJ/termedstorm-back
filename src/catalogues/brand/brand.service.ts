import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand) private readonly brandRepository: Repository<Brand>) {}

  async create(createDto: CreateBrandDto): Promise<Brand> {
    const newBrand = this.brandRepository.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
    });
    return this.brandRepository.save(newBrand);
  }

  async findAll(): Promise<Brand[]> {
    return this.brandRepository.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { id, isActive: true },
    });
    if (!brand) throw new NotFoundException(`Brand with id ${id} not found`);
    return brand;
  }

  async update(
    id: string,
    updateDto: UpdateBrandDto,
  ): Promise<{ message: string }> {
    const exists = await this.brandRepository.findOne({
      where: { id, isActive: true },
    });
    if (!exists) throw new NotFoundException(`Brand with id ${id} not found`);
    await this.brandRepository.update(id, updateDto);
    return { message: `Brand with id ${id} updated successfully` };
  }

  async delete(id: string): Promise<{ message: string }> {
    const exists = await this.brandRepository.findOne({
      where: { id, isActive: true },
    });
    if (!exists) throw new NotFoundException(`Brand with id ${id} not found`);
    await this.brandRepository.update(id, { isActive: false });
    return { message: `Brand with id ${id} deactivated successfully` };
  }
}
