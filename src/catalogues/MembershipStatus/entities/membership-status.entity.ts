import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tc_membership_status')
export class MembershipStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  membershipStatus: string; //! active- cancelled - expired??

  @Column({ default: true })
  isActive: boolean;
}
