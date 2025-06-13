import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductVariantDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsOptional()
  sizeUS: number;

  @IsNumber()
  @IsOptional()
  sizeEUR: number;

  @IsNumber()
  @IsOptional()
  sizecm: number;

  @IsString()
  @IsOptional()
  color: string;

  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @IsString()
  @IsNotEmpty()
  idProduct: string;
}