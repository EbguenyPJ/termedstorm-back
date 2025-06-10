import { IsString, IsOptional, IsBoolean, IsUUID, IsNotEmpty } from 'class-validator';

export class CreatePaymentMethodDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
