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
} from 'typeorm';
import { OrderDetail } from './orderDetail.entity';

@Entity({ name: 'ORDERS' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 's_folio_order', type: 'varchar' })
  folio: string;

  @Column({ name: 'n_total_products', type: 'int' })
  totalProducts: number;

  @Column({ name: 'n_total_order', type: 'decimal', precision: 10, scale: 2 })
  totalOrder: number;

  @Column({ name: 'd_date_order', type: 'date' })
  date: string;

  @Column({ name: 't_time_order', type: 'time' })
  time: string;

  @Column({ name: 'b_activo', type: 'smallint', default: 1 })
  activo: number;

  @OneToMany(() => OrderDetail, (detail) => detail.order, { cascade: true })
  details: OrderDetail[];

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'id_client' })
  client: Client;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'id_employee' })
  employee: Employee;

  //nombre de cashReconciliations ok ??

  // @ManyToOne(() => CashReconciliations, { nullable: true })
  // @JoinColumn({ name: 'cash_reconciliations' })
  // cashReconciliations: CashReconciliations;

  // @ManyToOne(() => TypeOfPayment)
  // @JoinColumn({ name: 'type_of_payment' })
  // typeOfPayment: TypeOfPayment;
}
