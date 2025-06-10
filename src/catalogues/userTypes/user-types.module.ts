import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserType } from './entities/user-types.entity';
import { UserTypeService } from './user-types.service';
import { UserTypeController } from './user-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserType])],
  providers: [UserTypeService],
  controllers: [UserTypeController],
})
export class UserTypeModule {}