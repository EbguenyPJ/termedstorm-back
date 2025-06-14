import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGenderDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toLowerCase())
  name: string;
}