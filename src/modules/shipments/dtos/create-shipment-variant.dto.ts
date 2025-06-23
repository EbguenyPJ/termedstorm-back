import { IsArray, IsNumber, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateShipmentSizeDto } from './create-shipment-size.dto';

export class CreateShipmentVariantDto {
  @IsNumber()
  @IsNotEmpty()
  variantId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShipmentSizeDto)
  sizes: CreateShipmentSizeDto[];
}
