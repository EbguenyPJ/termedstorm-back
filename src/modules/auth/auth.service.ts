import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { Employee } from '../users/entities/employee.entity';
import { Client } from '../users/entities/client.entity';

import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { RegisterClientDto } from './dto/register-client.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async registerEmployee(registerEmployeeDto: RegisterEmployeeDto) {
    return this.registerUserWithRole(registerEmployeeDto, 'employee');
  }

  async registerClient(registerClientDto: RegisterClientDto) {
    return this.registerUserWithRole(registerClientDto, 'client');
  }

  private async registerUserWithRole(
    dto: RegisterEmployeeDto | RegisterClientDto,
    role: 'employee' | 'client',
  ) {
    const { password, email, ...userData } = dto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email },
      });
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = this.userRepository.create({
        ...userData,
        email,
        password: hashedPassword,
      });
      await queryRunner.manager.save(User, newUser);

      if (role === 'employee') {
        const newEmployee = new Employee();
        newEmployee.user = newUser;
        await queryRunner.manager.save(Employee, newEmployee);
      } else if (role === 'client') {
        const clientDto = dto as RegisterClientDto;
        const newClient = new Client();
        newClient.membership_id = clientDto.membership_id;
        newClient.user = newUser;
        await queryRunner.manager.save(Client, newClient);
      }

      await queryRunner.commitTransaction();

      return newUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
