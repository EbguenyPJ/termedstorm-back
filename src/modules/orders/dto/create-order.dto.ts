import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  IsNotEmpty,
  IsIn,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductOrderDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  quantity: number;
}

export class CreateOrderDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsIn(['Efectivo', 'Tarjeta'])
  typeOfPayment?: 'Efectivo' | 'Tarjeta';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOrderDto)
  products: ProductOrderDto[];
}
