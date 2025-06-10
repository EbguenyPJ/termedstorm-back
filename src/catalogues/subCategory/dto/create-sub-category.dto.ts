import { IsString, IsOptional, IsBoolean, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateSubCategoryDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
