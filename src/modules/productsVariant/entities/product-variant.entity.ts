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
  sizeUS: number;

  @Column('float')
  sizeEUR: number;

  @Column('float')
  sizecm: number;

  @Column()
  color: string;

  @Column()
  stock: number;

  @Column('uuid')
  idProduct: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'id_product' })
  product: Product;
}
