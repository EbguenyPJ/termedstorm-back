import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Category } from 'src/catalogues/category/entities/category.entity';
import { SubCategory } from 'src/catalogues/subCategory/entities/sub-category.entity';
import { Brand } from 'src/catalogues/brand/entities/brand.entity';
import { Gender } from 'src/catalogues/gender/entities/gender.entity';
import { ProductVariant } from 'src/modules/productsVariant/entities/product-variant.entity';
import { ProductModification } from 'src/modules/productModification/entities/product-modification.entity';

@Entity('tw_products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    length: 200,
  })
  name: string;

  @Column('text')
  description: string;

  @Column('varchar', {
    length: 200,
    unique: true,
  })
  code: string;

  @Column('text')
  image: string;

  @Column('decimal', { precision: 10, scale: 2 })
  purchase_price: number;

  @Column('decimal', { precision: 10, scale: 2 })
  sale_price: number;

  @Column('uuid')
  employee_id: string;

  @Column('uuid')
  modified_id: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at' })
  deleted_at: Date;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => SubCategory)
  @JoinColumn({ name: 'subCategory_id' })
  sub_category: SubCategory;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToOne(() => Gender)
  @JoinColumn({ name: 'gender_id' })
  gender: Gender;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => ProductModification, (modification) => modification.product)
  modification: ProductModification[];

  //   @ManyToOne(() => User)
  //   @JoinColumn({ name: 'created_by' })
  //   createdBy: User;

  //   @ManyToOne(() => User)
  //   @JoinColumn({ name: 'modified_by' })
  //   modifiedBy: User;
}
