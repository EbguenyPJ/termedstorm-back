import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Gender } from './entities/gender.entity';
import { CreateGenderDto } from './dto/create-gender.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class GenderService {
  constructor(
    @InjectRepository(Gender)
    private readonly genderRepository: Repository<Gender>,
  ) {}

  async create(createDto: CreateGenderDto): Promise<any> {
    const { name } = createDto;

    const existing = await this.genderRepository.findOne({
      where: [{ name }],
    });

    if (existing) {
      throw new BadRequestException(`Gender already exists with name: ${name}`);
    }
    const gender = this.genderRepository.create({ ...createDto });
    const saved = await this.genderRepository.save(gender);
    return instanceToPlain(saved);
  }

  async findAll(): Promise<any> {
    return this.genderRepository.find();
  }

  async findOne(id: string): Promise<Gender> {
    const gender = await this.genderRepository.findOne({});
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
      where: { id },
    });
    if (!exists) throw new NotFoundException(`Gender with id ${id} not found`);
    await this.genderRepository.update(id, updateDto);
    return { message: `Gender with id ${id} updated successfully` };
  }

  async delete(id: string): Promise<{ message: string }> {
    const exists = await this.genderRepository.findOne({
      where: { id },
    });
    if (!exists) throw new NotFoundException(`Gender with id ${id} not found`);
    await this.genderRepository.softDelete(id);
    return { message: `Gender with id ${id} deactivated successfully` };
  }
}
