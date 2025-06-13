import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Gender } from './entities/gender.entity';
import { CreateGenderDto } from './dto/create-gender.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GenderService {
  constructor( @InjectRepository(Gender) private readonly genderRepository: Repository<Gender>) {}

  async create(createDto: CreateGenderDto): Promise<Gender> {
    const gender = this.genderRepository.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
    });
    return this.genderRepository.save(gender);
  }

  async findAll(): Promise<Gender[]> {
    return this.genderRepository.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<Gender> {
    const gender = await this.genderRepository.findOne({
      where: { id, isActive: true },
    });
    if (!gender) {
      throw new NotFoundException(`Gender with id ${id} not found`);
    }
    return gender;
  }

  async update(
    id: string,
    updateDto: UpdateGenderDto,
  ): Promise<{ message: string }> {
    const exists = await this.genderRepository.findOne({
      where: { id, isActive: true },
    });
    if (!exists) throw new NotFoundException(`Gender with id ${id} not found`);
    await this.genderRepository.update(id, updateDto);
    return { message: `Gender with id ${id} updated successfully` };
  }

  async delete(id: string): Promise<{ message: string }> {
    const exists = await this.genderRepository.findOne({
      where: { id, isActive: true },
    });
    if (!exists) throw new NotFoundException(`Gender with id ${id} not found`);
    await this.genderRepository.update(id, { isActive: false });
    return { message: `Gender with id ${id} deactivated successfully` };
  }
}
