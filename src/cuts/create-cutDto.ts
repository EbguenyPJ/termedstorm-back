import {
  IsInt,
  IsString,
  IsDateString,
  IsMilitaryTime,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCutDto {
  @ApiProperty({ example: '2025-06-28' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '18:30:00' })
  @IsMilitaryTime()
  time: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(0)
  auditCount: number;

  @ApiProperty({ example: 15000.5 })
  @IsNumber()
  totalAudits: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  saleCount: number;

  @ApiProperty({ example: 30000.0 })
  @IsNumber()
  totalCashSales: number;

  @ApiProperty({ example: 'Cierre de caja del turno mañana' })
  @IsString()
  description: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  expenseCount: number;

  @ApiProperty({ example: 4500.75 })
  @IsNumber()
  totalExpenses: number;

  @ApiProperty({ example: 'f4a93f98-4a4d-4d98-8e6a-1b8768d7bd5a' })
  @IsString()
  employeeId: string;
}






