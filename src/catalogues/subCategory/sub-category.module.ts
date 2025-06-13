import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCategory } from './entities/sub-category.entity';
import { SubCategoryService } from './sub-category.service';
import { SubCategoryController } from './sub-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SubCategory])],
  providers: [SubCategoryService],
  controllers: [SubCategoryController],
})
export class SubCategoryModule {}
