import { IsNumber } from 'class-validator';

export class CreateSizeDto {
  @IsNumber()
  size_us: number;

  @IsNumber()
  size_eur: number;

  @IsNumber()
  size_cm: number;
}