import { IsString, IsOptional, IsBoolean, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
