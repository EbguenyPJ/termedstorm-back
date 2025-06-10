import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tc_sub_category')
export class SubCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    length: 100,
  })
  name: string;

  @Column('varchar', {
    length: 100,
  })
  key: string;

  @Column('text', {
    default: 'No image',
  })
  image: string;

  @Column({ default: true })
  isActive: boolean;
}
