import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductVariantDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsOptional()
  size_us: number;

  @IsNumber()
  @IsOptional()
  size_eur: number;

  @IsNumber()
  @IsOptional()
  size_cm: number;

  @IsString()
  @IsOptional()
  color: string;

  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @IsString()
  @IsNotEmpty()
  product_id_relation: string;
}