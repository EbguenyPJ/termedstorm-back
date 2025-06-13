import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { Employee } from '../users/entities/employee.entity';
import { Client } from '../users/entities/client.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
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

  //% 1. El servicio ya no debe devolver un objeto, sino solo la cadena del token, que el controlador usará para crear la cookie
  // async login(loginDto: LoginDto): Promise<{ access_token: string }> {
  async login(loginDto: LoginDto): Promise<string> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['employee', 'employee.roles'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.employee) {
      throw new UnauthorizedException('This login is for employees only.');
    }

    const roles = user.employee.roles.map((role) => role.name);

    const payload = {
      sub: user.id,
      email: user.email,
      roles: roles,
    };

    //%1. Firmar y devolver EL TOKEN (no el objeto)
    return this.jwtService.sign(payload);

    //%1. Esto devuelve el objeto
    // return {
    //   access_token: this.jwtService.sign(payload),
    // };
  }
}
