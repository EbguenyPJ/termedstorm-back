import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Color } from './entities/colorProduct.entity';
import { ColorService } from './colorProduct.service';
import { ColorController } from './colorPorduct.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Color])],
  providers: [ColorService],
  controllers: [ColorController],
  exports: [ColorService],
})
export class ColorModule {}