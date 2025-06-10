import { IsString, IsBoolean, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateUserTypeDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  userType: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean; 
}