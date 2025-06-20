import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tc_cancel_reason')
export class CancellationReason {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ default: true })
  isActive: boolean;
}
