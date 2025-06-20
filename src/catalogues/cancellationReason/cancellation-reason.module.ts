import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CancellationReasonService } from './cancellation-reason.service';
import { CancellationReasonController } from './cancellation-reason.controller';
import { CancellationReason } from './entities/cancellation-reason.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CancellationReason])],
  providers: [CancellationReasonService],
  controllers: [CancellationReasonController],
  exports: [CancellationReasonService, TypeOrmModule],
})
export class CancellationReasonModule {}
