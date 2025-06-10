import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserType } from './entities/user-types.entity';
import { CreateUserTypeDto } from './dto/create-user-type.dto';
import { UpdateUserTypeDto } from './dto/update-user-type.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserTypeService {
  
  constructor(
    @InjectRepository(UserType)
    private readonly userTypeRepo: Repository<UserType>) {}

  async create(createDto: CreateUserTypeDto): Promise<UserType> {
    const userType = this.userTypeRepo.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
    });
    return this.userTypeRepo.save(userType);
  }

  async findAll(): Promise<UserType[]> {
    return this.userTypeRepo.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<UserType> {
    const userType = await this.userTypeRepo.findOne({
      where: { id, isActive: true },
    });
    if (!userType) {
      throw new NotFoundException(
        `UserType with id ${id} not found or inactive`,
      );
    }
    return userType;
  }

  async update(
    id: string,
    updateDto: UpdateUserTypeDto,
  ): Promise<{ message: string }> {
    const exists = await this.userTypeRepo.findOne({
      where: { id, isActive: true },
    });
    if (!exists) {
      throw new NotFoundException(
        `UserType with id ${id} not found or inactive`,
      );
    }
    await this.userTypeRepo.update(id, updateDto);
    return { message: `UserType with id ${id} updated successfully` };
  }

  async delete(id: string): Promise<{ message: string }> {
    const exists = await this.userTypeRepo.findOne({
      where: { id, isActive: true },
    });
    if (!exists) {
      throw new NotFoundException(
        `UserType with id ${id} not found or already inactive`,
      );
    }
    await this.userTypeRepo.update(id, { isActive: false });
    return { message: `UserType with id ${id} deactivated successfully` };
  }
}
