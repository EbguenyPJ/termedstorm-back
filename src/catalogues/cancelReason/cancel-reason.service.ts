import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CancelReason } from './entities/cancel-reason.entity';
import { CreateCancelReasonDto } from './dto/create-cancel-reason.dto';
import { UpdateCancelReasonDto } from './dto/update-cancel-reason.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CancelReasonService {
  constructor(
    @InjectRepository(CancelReason)
    private readonly cancelReasonRepository: Repository<CancelReason>,
  ) {}

  async create(createDto: CreateCancelReasonDto): Promise<CancelReason> {
    const cancel = this.cancelReasonRepository.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
    });
    return this.cancelReasonRepository.save(cancel);
  }

  async findAll(): Promise<CancelReason[]> {
    return this.cancelReasonRepository.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<CancelReason> {
    const cancelReason = await this.cancelReasonRepository.findOne({ where: { id, isActive: true } });
    if (!cancelReason)
      throw new NotFoundException(`Cancel reason with id ${id} not found`);
    return cancelReason;
  }

  async update(
    id: string,
    updateDto: UpdateCancelReasonDto,
  ): Promise<{ message: string }> {
    const exists = await this.cancelReasonRepository.findOne({
      where: { id, isActive: true },
    });
    if (!exists)
      throw new NotFoundException(`Cancel reason with id ${id} not found`);
    await this.cancelReasonRepository.update(id, updateDto);
    return { message: `Cancel reason with id ${id} updated successfully` };
  }

  async delete(id: string): Promise<{ message: string }> {
    const exists = await this.cancelReasonRepository.findOne({
      where: { id, isActive: true },
    });
    if (!exists)
      throw new NotFoundException(`Cancel reason with id ${id} not found`);
    await this.cancelReasonRepository.update(id, { isActive: false });
    return { message: `Cancel reason with id ${id} deactivated successfully` };
  }
}
