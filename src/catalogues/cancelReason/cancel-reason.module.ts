import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CancelReason } from './entities/cancel-reason.entity';
import { CancelReasonService } from './cancel-reason.service';
import { CancelReasonController } from './cancel-reason.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CancelReason])],
  providers: [CancelReasonService],
  controllers: [CancelReasonController],
})
export class CancelReasonModule {}
