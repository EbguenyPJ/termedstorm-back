import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tc_cancel_reason')
export class CancelReason {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    length: 500,
  })
  reason: string;

  @Column({ default: true })
  isActive: boolean;
}