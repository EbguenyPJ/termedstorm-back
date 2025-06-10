import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserTypeDto {
  @IsString()
  @IsOptional()
  userType?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}