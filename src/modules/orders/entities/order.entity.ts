import { Client } from 'src/modules/temp-entities/client.placeholder.entity';
import { Employee } from 'src/modules/temp-entities/employee.placeholder.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { OrderDetail } from './orderDetail.entity';

@Entity({ name: 'tw_orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  folio: string;

  @Column({ type: 'int' })
  totalProducts: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalOrder: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  time: string;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OrderDetail, (detail) => detail.order, { cascade: true })
  details: OrderDetail[];

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'tw_client' })
  client: Client;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'tw_employee' })
  employee: Employee;

  //nombre de cashReconciliations ok ??

  // @ManyToOne(() => CashReconciliations, { nullable: true })
  // @JoinColumn({ name: 'cash_reconciliations' })
  // cashReconciliations: CashReconciliations;

  // @ManyToOne(() => TypeOfPayment)
  // @JoinColumn({ name: 'type_of_payment' })
  // typeOfPayment: TypeOfPayment;
}
