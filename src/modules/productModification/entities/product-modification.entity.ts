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

@Entity('tw_product_modification')
export class ProductModification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  id_product: string;

  @Column('text')
  modification_field_name: string;

  @Column('text')
  previous_state: string;

  @Column('text')
  current_state: string;

  @Column('uuid')
  id_employee: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at' })
  deleted_at: Date;

  @ManyToOne(() => Product, (product) => product.modification)
  @JoinColumn({ name: 'id_product' })
  product: Product;
}
