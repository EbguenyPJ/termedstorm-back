import { Controller, Post, Get, Param, Res } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @ApiOperation({ summary: 'Enviar ticket de compra por email (PDF)' })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  @Post('send-confirmation/:id')
  async sendEmail(@Param('id') id: string) {
    return this.checkoutService.sendConfirmationEmail(id);
  }

  @ApiOperation({ summary: 'Enviar ticket de prueba (mock)' })
  @Post('send-test')
  sendTestEmail() {
    const mockOrder: any = {
      folio: 'F123456',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      totalOrder: 2499.99,
      client: { email: 'tu-correo@gmail.com' },
      details: [
        {
          product: { name: 'Zapatillas Nike Air Max' },
          totalAmountOfProducts: 1,
          subtotalOrder: 1499.99,
        },
        {
          product: { name: 'Buzo Adidas Essentials' },
          totalAmountOfProducts: 1,
          subtotalOrder: 1000.0,
        },
      ],
    };

    return this.checkoutService.sendConfirmationEmail(mockOrder);
  }

  @ApiOperation({ summary: 'Visualizar ticket de compra en PDF' })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  @Get('ticket/:id')
  async showTicket(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.checkoutService.generateTicketPdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=ticket.pdf',
    });

    res.end(buffer);
  }
}
