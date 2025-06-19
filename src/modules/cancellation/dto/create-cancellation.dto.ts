import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCancellationDto {
  @IsString()
  @IsNotEmpty()
  cancellationReasonId: string;

  @IsString()
  @IsOptional()
  comment?: string;
}
