import { Brand } from 'src/catalogues/brand/entities/brand.entity';
import { Category } from 'src/catalogues/category/entities/category.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';

@Entity('tc_sub_category')
export class SubCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    length: 100,
  })
  name: string;

  @Column('varchar', {
    length: 100,
  })
  key: string;

  @Column('text', {
    default: 'No image',
  })
  image: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Category, (category) => category.subcategories)
  categories: Category[];

  @ManyToMany(() => Brand, (brand) => brand.subcategories)
  @JoinTable({ name: 'tr_subcategory_brand'})
  brands: Brand[];
}

