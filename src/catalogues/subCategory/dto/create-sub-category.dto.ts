import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsUUID, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateSubCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toLowerCase())
  name: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  image: string;

  @IsNotEmpty()
  @IsUUID('4', { each: true })
  categories: string[];

  @IsUUID('4', { each: true })
  @IsNotEmpty()
  brands: string[];
}
