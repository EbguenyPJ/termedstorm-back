import { SubCategory } from 'src/catalogues/subCategory/entities/sub-category.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';

@Entity('tc_category')
export class Category {
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

  @ManyToMany(() => SubCategory, (subCategory) => subCategory.categories)
    @JoinTable({ name: 'tc_category_sub_category' })
    subcategories: SubCategory[];
}
