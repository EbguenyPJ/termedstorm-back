import { SubCategory } from 'src/catalogues/subCategory/entities/sub-category.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

@Entity('tc_brands')
export class Brand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    length: 50,
  })
  brand: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => SubCategory, (subCategory) => subCategory.brands)
  subcategories: SubCategory[];
}
