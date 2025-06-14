import { IsString, IsOptional } from 'class-validator';

export class UpdateGenderDto {
  @IsString()
  @IsOptional()
  name?: string;
}