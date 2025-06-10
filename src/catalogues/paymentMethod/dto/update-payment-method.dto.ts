import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdatePaymentMethodDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
