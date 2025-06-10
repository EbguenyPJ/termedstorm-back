import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tc_brands')
export class Brand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    length: 50,
  })
  brand: string;

  @Column({ default: true })
  isActive: boolean;
}
