import { Module } from '@nestjs/common';
//import { TypeOrmModule } from '@nestjs/typeorm';
import { CancellationReasonService } from './cancellation-reason.service';
import { CancellationReasonController } from './cancellation-reason.controller';
import { CancellationReason } from './entities/cancellation-reason.entity';
import { TenantTypeOrmModule } from '../../common/typeorm-tenant-repository/tenant-repository.provider';

@Module({
  imports: [TenantTypeOrmModule.forFeature([CancellationReason])],
  providers: [CancellationReasonService],
  controllers: [CancellationReasonController],
  exports: [CancellationReasonService],
})
export class CancellationReasonModule {}
