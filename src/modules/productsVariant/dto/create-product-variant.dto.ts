import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductVariantDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  color: string;

  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @IsString()
  @IsNotEmpty()
  size_id: string;

  @IsString()
  @IsOptional()
  product_id?: string;
}