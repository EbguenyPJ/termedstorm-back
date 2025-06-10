import { IsString, IsOptional, IsBoolean, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateCancelReasonDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
