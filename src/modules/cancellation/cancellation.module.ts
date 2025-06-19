import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CancellationService } from './cancellation.service';
import { CancellationController } from './cancellation.controller';
import { Cancellation } from './entities/cancellation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cancellation])],
  controllers: [CancellationController],
  providers: [CancellationService],
  exports: [CancellationService],
})
export class CancellationModule {}
