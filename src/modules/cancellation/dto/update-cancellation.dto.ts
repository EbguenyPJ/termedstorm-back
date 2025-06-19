import { IsString, IsInt, IsOptional } from 'class-validator';

export class UpdateCancellationDto {
  @IsInt()
  @IsOptional()
  cancellation_reason_id?: string;

  @IsString()
  @IsOptional()
  cancellation_comment?: string;
}
