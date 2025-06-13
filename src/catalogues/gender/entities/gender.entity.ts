import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tc_gender')
export class Gender {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    length: 50,
  })
  gender: string;

  @Column({ default: true })
  isActive: boolean;
}
