import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { CancellationReason } from './entities/cancellation-reason.entity';
import { CreateCancellationReasonDto } from './dto/create-cancellation-reason.dto';
import { UpdateCancellationReasonDto } from './dto/update-cancellation-reason.dto';

@Injectable()
export class CancellationReasonService {
  constructor(
    @InjectRepository(CancellationReason)
    private readonly CancellationReasonRepository: Repository<CancellationReason>,
  ) {}

  async create(
    createDto: CreateCancellationReasonDto,
  ): Promise<CancellationReason> {
    const cancel = this.CancellationReasonRepository.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
    });
    return this.CancellationReasonRepository.save(cancel);
  }

  async findAll(): Promise<CancellationReason[]> {
    return this.CancellationReasonRepository.find({
      where: { isActive: true },
    });
  }

  async findOne(id: string): Promise<CancellationReason> {
    const CancellationReason = await this.CancellationReasonRepository.findOne({
      where: { id, isActive: true },
    });
    if (!CancellationReason)
      throw new NotFoundException(`Cancel reason with id ${id} not found`);
    return CancellationReason;
  }

  async update(
    id: string,
    updateDto: UpdateCancellationReasonDto,
  ): Promise<{ message: string }> {
    const exists = await this.CancellationReasonRepository.findOne({
      where: { id, isActive: true },
    });
    if (!exists)
      throw new NotFoundException(`Cancel reason with id ${id} not found`);
    await this.CancellationReasonRepository.update(id, updateDto);
    return { message: `Cancel reason with id ${id} updated successfully` };
  }

  async delete(id: string): Promise<{ message: string }> {
    const exists = await this.CancellationReasonRepository.findOne({
      where: { id, isActive: true },
    });
    if (!exists)
      throw new NotFoundException(`Cancel reason with id ${id} not found`);
    await this.CancellationReasonRepository.update(id, { isActive: false });
    return { message: `Cancel reason with id ${id} deactivated successfully` };
  }
}
