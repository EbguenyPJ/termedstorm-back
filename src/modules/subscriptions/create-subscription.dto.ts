import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateSubscriptionDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  price_id: string; // aca va a tomar cualquier tipo de membresia, ya sea de cliente final o Company,

  @IsString()
  @IsNotEmpty()
  @IsIn(['customer', 'client'])
  context: 'customer' | 'client';

  @IsOptional()
  customer_id?: string;

  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;
}
