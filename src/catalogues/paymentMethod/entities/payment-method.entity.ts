import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tc_payment_method')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    length: 100,
  })
  name: string;

  @Column({ default: true })
  isActive: boolean;
}
