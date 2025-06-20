import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CancellationService } from './cancellation.service';
import { CancellationController } from './cancellation.controller';
import { Cancellation } from './entities/cancellation.entity';
import { CancellationReasonModule } from 'src/catalogues/cancellationReason/cancellation-reason.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cancellation]), CancellationReasonModule],
  controllers: [CancellationController],
  providers: [CancellationService],
  exports: [CancellationService],
})
export class CancellationModule {}
