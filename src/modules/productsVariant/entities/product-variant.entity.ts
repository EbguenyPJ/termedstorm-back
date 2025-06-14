import { Product } from 'src/modules/products/entities/product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('tw_variant_product')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column('float')
  size_us: number;

  @Column('float')
  size_eur: number;

  @Column('float')
  sizecm: number;

  @Column()
  color: string;

  @Column()
  stock: number;

  @Column('uuid')
  id_product: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at' })
  deleted_at: Date;

  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'id_product_relation' })
  product: Product;
}
