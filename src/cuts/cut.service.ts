import { Injectable, NotFoundException } from '@nestjs/common';
import { Cut } from './cut.entity';
import { CreateCutDto } from './create-cutDto';
import { UpdateCutDto } from './update-cutDto';
import { CutRepository } from './cut.repository';

@Injectable()
export class CutsService {
  constructor(private readonly repo: CutRepository) {}

  create(dto: CreateCutDto) {
    return this.repo.createCut(dto);
  }

  findAll() {
    return this.repo.findAll();
  }

  async findOne(id: number) {
    const cut = await this.repo.findOne(id);
    if (!cut) throw new NotFoundException(`Cut #${id} not found`);
    return cut;
  }

  update(id: number, dto: UpdateCutDto) {
    return this.repo.updateCut(id, dto);
  }

  async remove(id: number) {
    const cut = await this.findOne(id);
    return this.repo.remove(cut);
  }
}