import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCancelReasonDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
