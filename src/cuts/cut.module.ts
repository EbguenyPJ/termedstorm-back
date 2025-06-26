import { Module } from '@nestjs/common';
//import { TypeOrmModule } from '@nestjs/typeorm';
import { Cut } from 'src/cuts/cut.entity';
import { Audit } from 'src/audits/audit.entity';
import { CutService } from 'src/cuts/cut.service';
import { CutController } from 'src/cuts/cut.controller';
import { CutRepository } from 'src/cuts/cut.repository';
import { TenantTypeOrmModule } from 'src/common/typeorm-tenant-repository/tenant-repository.provider';
@Module({
  imports: [TenantTypeOrmModule.forFeature([Cut, Audit])],
  controllers: [CutController],
  providers: [CutService, CutRepository],
})
export class CutModule {}
