import { Injectable } from '@nestjs/common';
//import { InjectRepository } from '@nestjs/typeorm';
import { Cut } from './cut.entity';
import { Repository, IsNull } from 'typeorm';
import { Audit } from 'src/audits/audit.entity';
import { InjectTenantRepository } from 'src/common/typeorm-tenant-repository/tenant-repository.decorator';

@Injectable()
export class CutRepository {
  constructor(
    @InjectTenantRepository(Cut)
    private readonly cutRepo: Repository<Cut>,

    @InjectTenantRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
  ) {}

  async getUnassignedAudits() {
    return this.auditRepo.find({
      where: { cut_id: IsNull() },
    });
  }

  async createCut(data: Partial<Cut>) {
    const newCut = this.cutRepo.create(data);
    return this.cutRepo.save(newCut);
  }

  async assignAuditsToCut(auditIds: number[], cut_id: number) {
    await Promise.all(
      auditIds.map((id) => this.auditRepo.update(id, { cut_id })),
    );
  }

  async findAll() {
    return this.cutRepo.find();
  }

  async updateCut(id: number, updateDto: Partial<Cut>) {
    await this.cutRepo.update(id, updateDto);
    return this.cutRepo.findOne({ where: { id } });
  }
}
