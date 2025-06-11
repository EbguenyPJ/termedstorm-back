import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { Employee } from '../users/entities/employee.entity';
import { Client } from '../users/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Employee, Client])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
