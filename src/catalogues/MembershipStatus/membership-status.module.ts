import { Module } from '@nestjs/common';
//import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipStatus } from './entities/membership-status.entity';
import { MembershipStatusService } from './membership-status.service';
import { MembershipStatusController } from './membership-status.controller';
import { TenantTypeOrmModule } from 'src/common/typeorm-tenant-repository/tenant-repository.provider';

@Module({
  imports: [TenantTypeOrmModule.forFeature([MembershipStatus])],
  providers: [MembershipStatusService],
  controllers: [MembershipStatusController],
})
export class MembershipStatusModule {}
