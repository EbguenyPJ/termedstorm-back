import { Injectable } from '@nestjs/common';
import { Repository, IsNull } from 'typeorm';
import { InjectTenantRepository } from 'src/common/typeorm-tenant-repository/tenant-repository.decorator';
import { Cut } from './cut.entity';
import { Audit } from 'src/audits/audit.entity';

@Injectable()
export class CutRepository {
  constructor(
    @InjectTenantRepository(Cut)
    private readonly cutRepo: Repository<Cut>,

    @InjectTenantRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
  ) {}

  async getUnassignedAudits() {
    return this.auditRepo.find({ where: { cut: IsNull() } });
  }

  createCut(data: Partial<Cut>) {
    const newCut = this.cutRepo.create(data);
    return this.cutRepo.save(newCut);
  }

  assignAuditsToCut(auditIds: number[], cutId: number) {
    return Promise.all(
      auditIds.map((id) => this.auditRepo.update(id, { cut: { id: cutId } })),
    );
  }

  findAll() {
    return this.cutRepo.find({ relations: ['employee', 'audits'] });
  }

  findOne(id: number) {
    return this.cutRepo.findOne({
      where: { id },
      relations: ['employee', 'audits'],
    });
  }

  updateCut(id: number, updateDto: Partial<Cut>) {
    return this.cutRepo.update(id, updateDto).then(() => this.findOne(id));
  }

  remove(cut: Cut) {
    return this.cutRepo.remove(cut);
  }
}
