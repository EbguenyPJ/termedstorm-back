import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';
import { PaymentMethod } from '../payment-method.enum'; // <-- agregar esto

export class UpdateOrderDto {
  @ApiProperty({
    example: OrderStatus.CANCELLED,
    enum: OrderStatus,
    description: 'El nuevo estado de la orden',
  })
  @IsEnum(OrderStatus, {
    message: `El estado debe ser uno de los siguientes: ${Object.values(OrderStatus).join(', ')}`,
  })
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({
    example: PaymentMethod.Efectivo,
    enum: PaymentMethod,
    description: 'Nuevo método de pago',
  })
  @IsEnum(PaymentMethod, {
    message: `El método de pago debe ser uno de los siguientes: ${Object.values(PaymentMethod).join(', ')}`,
  })
  @IsOptional()
  payment_method?: PaymentMethod;
}






// import { ApiProperty } from '@nestjs/swagger';
// import { IsOptional, IsString } from 'class-validator';

// export class UpdateOrderDto {
//   @ApiProperty({ example: 'Cancelada' })
//   @IsString()
//   @IsOptional()
//   status?: string;
// }
