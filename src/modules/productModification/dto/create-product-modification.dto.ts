import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateProductModificationDto {
  @IsUUID()
  @IsNotEmpty()
  id_product: string;

  @IsString()
  @IsNotEmpty()
  modification_field_name: string;

  @IsString()
  @IsNotEmpty()
  previous_state: string;

  @IsString()
  @IsNotEmpty()
  current_state: string;

  @IsUUID()
  @IsNotEmpty()
  id_employee: string;
}
