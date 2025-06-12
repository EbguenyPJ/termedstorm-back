import { Product } from 'src/modules/temp-entities/product.placeholder.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('tw_orders_details')
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'n_precio_unitario',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column({ name: 'n_total_amount_products', type: 'int' })
  totalAmountOfProducts: number;

  @Column({
    name: 'n_subtotal_order',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  subtotalOrder: number;

  @Column({ name: 'b_activo', type: 'smallint', default: 1 })
  activo: number;

  @ManyToOne(() => Order, (order) => order.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_order' })
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'id_product' })
  product: Product;
}
