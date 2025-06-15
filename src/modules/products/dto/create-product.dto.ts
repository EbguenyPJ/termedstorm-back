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
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toLowerCase())
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsNumber()
  @IsNotEmpty()
  purchase_price: number;

  @IsNumber()
  @IsNotEmpty()
  sale_price: number;

  @IsUUID()
  category_id: string;

  @IsUUID()
  sub_category_id: string;

  @IsUUID()
  brand_id: string;

  @IsUUID()
  employee_id: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants: CreateProductVariantDto[];
}
