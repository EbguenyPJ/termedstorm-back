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
  idProduct: string;

  @Column('text')
  modificationFieldName: string;

  @Column('text')
  previousState: string;

  @Column('text')
  currentState: string;

  @Column('uuid')
  idEmployee: string;

@CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => Product, (product) => product.modification)
  @JoinColumn({ name: 'id_product' })
  product: Product;
}
