import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
} from 'class-validator';

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

  @IsUUID()
  modified_id: string;

  @IsUUID()
  gender_id: string;
}
