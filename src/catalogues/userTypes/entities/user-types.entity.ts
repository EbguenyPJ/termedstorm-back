import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tc_user_type')
export class UserType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    length: 100,
  })
  userType: string;

  @Column( {default: true })
  isActive: boolean;
}