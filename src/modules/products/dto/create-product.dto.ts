import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CreateProductVariantDto } from 'src/modules/productsVariant/dto/create-product-variant.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'Zapatillas Nike Air' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toLowerCase())
  name: string;

  @ApiProperty({ example: 'Zapatillas cómodas para correr largas distancias.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'NIKE-AIR-001' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 200 })
  @IsNumber()
  @IsNotEmpty()
  purchase_price: number;

  @ApiProperty({ example: 300 })
  @IsNumber()
  @IsNotEmpty()
  sale_price: number;

  @ApiProperty({ example: 'c735b720-84a0-4625-a94e-7f994f1e0a11' })
  @IsUUID()
  @IsNotEmpty()
  category_id: string;

  @ApiProperty({ example: 'c735b720-84a0-4625-a94e-7f994f1e0a11' })
  @IsUUID()
  @IsNotEmpty()
  sub_category_id: string;

  @ApiProperty({ example: 'c735b720-84a0-4625-a94e-7f994f1e0a11' })
  @IsUUID()
  @IsNotEmpty()
  brand_id: string;

  @IsOptional() // NACHO
  @IsString()
  slug?: string;

 @ApiProperty({
  type: [CreateProductVariantDto],
  example: [
    {
      description: 'Zapatilla talla 40 color negro',
      image: "https://miapp.com/images/zapatillas-nike-negro.jpg",
      color_id: 'c735b720-84a0-4625-a94e-7f994f1e0a11',
    }
  ]
})
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants: CreateProductVariantDto[];
}
