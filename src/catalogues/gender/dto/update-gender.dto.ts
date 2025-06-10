import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateGenderDto {
  @IsString()
  @IsOptional()
  gender?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}