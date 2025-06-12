import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import Stripe from 'stripe';
import { Product } from '../temp-entities/product.placeholder.entity';
import { Employee } from '../temp-entities/employee.placeholder.entity';
import { Client } from '../temp-entities/client.placeholder.entity';
import { Order } from '../temp-entities/order.placeholder.entity';
import { OrderDetail } from '../temp-entities/orderDetail.placeholder.entity';
import { TypeOfPayment } from '../temp-entities/typeOfPayment.placeholder.entity';

@Injectable()
export class OrdersService {
  constructor(private readonly dataSource: DataSource) {}

  async prepareOrderForCheckout(dto: CreateOrderDto) {
    const { products, employeeId, email } = dto;

    if (!products || products.length === 0) {
      throw new BadRequestException(
        'La orden debe contener al menos un producto.',
      );
    }

    const employee = new Employee();
    employee.id = employeeId;
    if (!employee) throw new NotFoundException('Empleado no encontrado');

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of products) {
      const product = new Product();
      product.id = item.productId;
      product.name = `Producto de Prueba ${item.productId}`;
      product.price = 15.99;
      product.stock = 100;

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para ${product.name}.`,
        );
      }

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: product.name },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      });
    }

    const metadata = {
      employeeId: employeeId,
      clientEmail: email || '',
      products: JSON.stringify(products),
    };

    return { lineItems, metadata };
  }

  async fulfillOrder(session: Stripe.Checkout.Session): Promise<Order> {
    if (!session.metadata || session.amount_total === null) {
      throw new Error('Faltan datos esenciales en la sesión de Stripe.');
    }

    const {
      employeeId,
      clientEmail,
      products: productsJSON,
    } = session.metadata;
    const orderProducts: { productId: string; quantity: number }[] =
      JSON.parse(productsJSON);

    const typeOfPaymentSelected = new TypeOfPayment();
    typeOfPaymentSelected.id = 2;
    typeOfPaymentSelected.typeOfPayment = 'Tarjeta';

    const employee = new Employee();
    employee.id = employeeId;

    let client: Client | null = null;
    if (clientEmail) {
      client = new Client();
      client.id = 'clientFalso123';
      client.email = clientEmail;
    }

    const order = new Order();
    order.id = 'ordenFalsa1234';
    order.employee = employee;
    order.client = client;
    //order.typeOfPayment = TypeOfPayment;
    order.date = new Date();
    order.totalOrder = session.amount_total / 100;
    order.totalProducts = orderProducts.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    order.stripeCheckoutSessionId = session.id;
    order.details = [];

    console.log('Orden creada:', order);

    for (const item of orderProducts) {
      const product = new Product();
      product.id = item.productId;
      product.name = `Producto Simulado ${item.productId}`;
      product.price = 10.0;
      product.stock = 50;

      const newStock = product.stock - item.quantity;
      if (newStock < 0) {
        throw new Error(`Stock insuficiente para ${product.name}.`);
      }

      console.log(`Stock de ${product.name} actualizado a: ${newStock}`);

      const detail = new OrderDetail();
      detail.id = `detail-simulado-${Math.random()}`;
      detail.order = order;
      detail.price = product.price;
      detail.product = product;
      detail.totalAmountOfProducts = item.quantity;
      detail.subtotalOrder = product.price * item.quantity;

      order.details.push(detail);

      console.log('Detalle de orden creado:', detail);
    }

    console.log(
      `Orden ${order.id} creada exitosamente desde la sesión de Stripe ${session.id}`,
    );

    return order;
  }

  // async findAll() {
  //   return await this.ordersRepository.find();
  // }

  //   async findOne(id: string) {
  //   const order = await this.ordersRepository.findOne({
  //     where: { id },
  //     relations: { orderDetails: true, user: true },
  //   });

  //   if (!order) {
  //     throw new NotFoundException(`Order with ID ${id} not found`);
  //   }

  //   return order;
  // }
}
