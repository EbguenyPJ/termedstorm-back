import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Client } from 'src/modules/temp-entities/client.placeholder.entity';
import { CompanyMembership } from './companyMembership.entity';
import { MembershipType } from './membershipType.entity';

@Entity({ name: 'tw_membership' })
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  creationDate: string;

  @Column({ type: 'date' })
  expirationDate: string;

  @Column({ type: 'varchar' })
  folioStripe: string;

  @ManyToOne(() => MembershipType)
  @JoinColumn({ name: 'id_tipo_membresia' })
  type: MembershipType;

  // @ManyToOne(() => MembershipStatus)
  // @JoinColumn({ name: 'tc_membership_status' })
  // status: MembershipStatus;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'tw_clients' })
  client: Client;

  @OneToOne(() => CompanyMembership)
  @JoinColumn({ name: 'tw_company_membership' })
  companyMembership: CompanyMembership;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
