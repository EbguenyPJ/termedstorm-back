import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateShipmentSizeDto {
  @IsNumber()
  @IsNotEmpty()
  sizeId: number;

  @IsNumber()
  @IsNotEmpty()
  stock: number;
}
