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
import { PaymentMethod } from 'src/catalogues/paymentMethod/entities/payment-method.entity';

@Entity({ name: 'tw_orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @Column({ type: 'varchar' })
  // folio: string;

  @Column({ type: 'int' })
  total_products: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_order: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  time: string;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => OrderDetail, (detail) => detail.order, { cascade: true })
  details: OrderDetail[];

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'tw_clients_relation' })
  client: Client;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'tw_employee_relation' })
  employee: Employee;

  //nombre de cashReconciliations ok ??

  // @ManyToOne(() => CashReconciliations, { nullable: true })
  // @JoinColumn({ name: 'cash_reconciliations_relation' })
  // cashReconciliations: CashReconciliations;

  @ManyToOne(() => PaymentMethod)
  @JoinColumn({ name: 'payment_method_relation' })
  paymentMethod: PaymentMethod;
}
