import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateBrandDto {
  @IsString()
  @IsOptional()
  brand?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
