import { IsString, IsBoolean, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateGenderDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}