import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import {Repository } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private readonly roleRepository: Repository<Role>) {}
  getTodos() {
    return this.roleRepository.find();
  }
}
