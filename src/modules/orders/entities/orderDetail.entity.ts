import { Product } from 'src/modules/temp-entities/product.placeholder.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('tw_order_details')
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column({ type: 'int' })
  totalAmountOfProducts: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  subtotalOrder: number;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Order, (order) => order.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_order' })//cambiar tw
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'id_product' }) //acmbiar tw
  product: Product;
}
