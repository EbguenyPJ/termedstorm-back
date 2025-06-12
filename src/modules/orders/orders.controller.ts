import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { StripeService } from '../stripe/stripe.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly stripeService: StripeService,
  ) {}

  @Post('create-checkout-session')
  async createCheckoutSession(@Body() createOrderDto: CreateOrderDto) {
    const { lineItems, metadata } =
      await this.ordersService.prepareOrderForCheckout(createOrderDto);

    const successUrl = 'http://tu-frontend.com/pago-exitoso';
    const cancelUrl = 'http://tu-frontend.com/pago-cancelado';

    const session = await this.stripeService.createCheckoutSession(
      lineItems,
      metadata,
      successUrl,
      cancelUrl,
    );

    return { url: session.url };
  }

  @Post('cash')
  async createCashOrder(@Body() createOrderDto: CreateOrderDto) {
    if (createOrderDto.typeOfPayment !== 'Efectivo') {
      throw new BadRequestException(
        'Este endpoint es solo para pagos en efectivo.',
      );
    }
  }

  //  @Get()
  // findAll() {
  //   return this.ordersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string, ) {

  //   return this.ordersService.findOne(id);
  // }

  // @Put(':id')
  // update(@Param('id') id: string, @Body() data: string) {
  //   return this.ordersService.update(id, data);
  // }
}

//crear el servicio para POST /orders/cash  para pagos en efectivo
