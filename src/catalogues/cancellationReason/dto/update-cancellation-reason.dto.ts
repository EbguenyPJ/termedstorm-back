import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCancellationReasonDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
