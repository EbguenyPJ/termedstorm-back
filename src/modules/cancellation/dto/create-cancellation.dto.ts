import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCancellationDto {
  @IsString()
  @IsNotEmpty()
  cancellation_reason_id: string;

  @IsString()
  @IsOptional()
  comment?: string;
}
