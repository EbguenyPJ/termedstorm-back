import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async create(createDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const paymentMethod = this.paymentMethodRepository.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
    });
    return this.paymentMethodRepository.save(paymentMethod);
  }

  async findAll(): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<PaymentMethod> {
    const payment = await this.paymentMethodRepository.findOne({
      where: { id, isActive: true },
    });
    if (!payment)
      throw new NotFoundException(`Payment method with id ${id} not found`);
    return payment;
  }

  async update(
    id: string,
    updateDto: UpdatePaymentMethodDto,
  ): Promise<{ message: string }> {
    const exists = await this.paymentMethodRepository.findOne({
      where: { id, isActive: true },
    });
    if (!exists)
      throw new NotFoundException(`Payment method with id ${id} not found`);
    await this.paymentMethodRepository.update(id, updateDto);
    return { message: `Payment method with id ${id} updated successfully` };
  }

  async delete(id: string): Promise<{ message: string }> {
    const exists = await this.paymentMethodRepository.findOne({
      where: { id, isActive: true },
    });
    if (!exists)
      throw new NotFoundException(`Payment method with id ${id} not found`);
    await this.paymentMethodRepository.update(id, { isActive: false });
    return { message: `Payment method with id ${id} deactivated successfully` };
  }
}
