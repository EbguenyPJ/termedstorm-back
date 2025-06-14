import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateOrderDto, ProductOrderDto } from './dto/create-order.dto';
import { StripeService } from '../stripe/stripe.service';
import { Order } from './entities/order.entity';
import { OrderDetail } from './entities/orderDetail.entity';
import { Employee } from '../temp-entities/employee.placeholder.entity';
import { Client } from '../temp-entities/client.placeholder.entity';
import Stripe from 'stripe';

import { ProductService } from '../products/product.service';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../productsVariant/entities/product-variant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly stripeService: StripeService,
    private readonly productService: ProductService,
  ) {}

  async processNewOrder(dto: CreateOrderDto) {
    if (dto.payment_method === 'Efectivo') {
      return this.createCashOrder(dto);
    }

    if (dto.payment_method === 'Tarjeta') {
      return this.createCardPaymentSession(dto);
    }

    throw new BadRequestException('Tipo de pago no soportado.');
  }

  async createCashOrder(dto: CreateOrderDto): Promise<Order> {
    const variantIds = dto.products.map((p) => p.variant_id);
    const dbVariants =
      await this.productService.findManyVariantsByIds(variantIds);
    const variantMap = new Map(dbVariants.map((v) => [v.id, v]));
    const totalOrder = dto.products.reduce((sum, orderItem) => {
      const variant = variantMap.get(orderItem.variant_id);
      if (!variant)
        throw new NotFoundException(
          `Variante con ID ${orderItem.variant_id} no encontrada.`,
        );
      return sum + variant.product.sale_price * orderItem.quantity;
    }, 0);

    return this.dataSource.transaction((entityManager) =>
      this.buildOrderInTransaction(
        {
          employeeId: dto.employee_id,
          clientEmail: dto.email,
          orderProducts: dto.products,
          dbVariants,
          totalOrder,
        },
        entityManager,
      ),
    );
  }

  async createCardPaymentSession(dto: CreateOrderDto) {
    const variantIds = dto.products.map((p) => p.variant_id);
    const dbVariants =
      await this.productService.findManyVariantsByIds(variantIds);
    const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

    const lineItems = dto.products.map((orderItem) => {
      const variant = variantMap.get(orderItem.variant_id);
      if (!variant)
        throw new NotFoundException(
          `Variante con ID ${orderItem.variant_id} no encontrada.`,
        );

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${variant.product.name} (${variant.description})`,
          },
          unit_amount: Math.round(variant.product.sale_price * 100),
        },
        quantity: orderItem.quantity,
      };
    });
    const metadata = {
      employeeId: dto.employee_id,
      clientEmail: dto.email || '',
      products: JSON.stringify(dto.products),
    };

    const session = await this.stripeService.createCheckoutSession(
      lineItems,
      metadata,
      'http://tu-frontend.com/pago-exitoso',
      'http://tu-frontend.com/pago-cancelado',
    );

    return { url: session.url };
  }

  async createOrderFromStripeSession(
    session: Stripe.Checkout.Session,
  ): Promise<Order> {
    if (
      !session.metadata ||
      !session.metadata.employeeId ||
      !session.metadata.products ||
      session.amount_total === null
    ) {
      throw new BadRequestException(
        'Datos de sesión de Stripe incompletos o inválidos.',
      );
    }
    const {
      employeeId,
      clientEmail,
      products: productsJSON,
    } = session.metadata;

    const orderProducts: ProductOrderDto[] = JSON.parse(productsJSON);

    const variantIds = orderProducts.map((p) => p.variant_id);
    const dbVariants =
      await this.productService.findManyVariantsByIds(variantIds);

    return this.dataSource.transaction((entityManager) =>
      this.buildOrderInTransaction(
        {
          employeeId,
          clientEmail,
          orderProducts,
          dbVariants,
          totalOrder: session.amount_total! / 100,
        },
        entityManager,
      ),
    );
  }

  async buildOrderInTransaction(
    data: {
      employeeId: string;
      clientEmail: string | null;
      orderProducts: ProductOrderDto[];
      dbVariants: ProductVariant[];
      totalOrder: number;
    },
    entityManager: EntityManager,
  ): Promise<Order> {
    const { employeeId, clientEmail, orderProducts, dbVariants, totalOrder } =
      data;

    const employee = await entityManager.findOneBy(Employee, {
      id: employeeId,
    });
    if (!employee)
      throw new NotFoundException(
        `Empleado con ID ${employeeId} no encontrado.`,
      );

    let client: Client | null = null;
    if (clientEmail) {
      client = await entityManager.findOne(Client, {
        where: { user: { email: clientEmail } },
        relations: ['user'],
      });
    }

    const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

    for (const item of orderProducts) {
      const variant = variantMap.get(item.variant_id);
      if (!variant)
        throw new NotFoundException(
          `Variante con ID ${item.variant_id} no encontrada.`,
        );
      if (variant.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para ${variant.product.name} (${variant.description}). Stock: ${variant.stock}.`,
        );
      }

      await entityManager.decrement(
        ProductVariant,
        { id: variant.id },
        'stock',
        item.quantity,
      );
    }

    const order = new Order();
    order.employee = employee;
    order.client = client!;
    order.total_order = totalOrder;
    order.total_products = orderProducts.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    order.date = new Date().toISOString().split('T')[0];
    order.time = new Date().toTimeString().split(' ')[0];

    order.details = orderProducts.map((item) => {
      const variant = variantMap.get(item.variant_id)!;
      return entityManager.create(OrderDetail, {
        variant,
        price: variant.product.sale_price,
        total_amount_of_products: item.quantity,
        subtotal_order: variant.product.sale_price * item.quantity,
      });
    });

    return entityManager.save(order);
  }

  async calculateOrderTotal(productDtos) {
    const productIds = productDtos.map((p) => p.productId);
    const dbProducts = await Promise.all(
      productIds.map((id) => this.productService.findOne(id)),
    );
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    let total = 0;

    const lineItems = productDtos.map((pDto) => {
      const product = productMap.get(pDto.productId);
      total += product!.sale_price * pDto.quantity;
      return {
        price_data: {
          currency: 'usd',
          product_data: { name: product!.name },
          unit_amount: Math.round(product!.sale_price * 100),
        },
        quantity: pDto.quantity,
      };
    });

    return { lineItems, total };
  }

  async findOneById(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        employee: true,
        client: {
          user: true,
        },
        details: {
          variant: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: {
        employee: true,
        client: { user: true },
      },
      order: {
        date: 'DESC',
        time: 'DESC',
      },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.preload({
      id: id,
      ...updateOrderDto,
    });

    if (!order) {
      throw new NotFoundException(`Orden con ID ${id} no encontrada.`);
    }

    return this.orderRepository.save(order);
  }
}

//

//

// async validateProductsStock(productDtos) {
//   const productIds = productDtos.map((p) => p.productId);
//   const dbProducts = await Promise.all(
//     productIds.map((id) => this.productService.findOne(id)),
//   );
//   const productMap = new Map(dbProducts.map((p) => [p.id, p]));

//   for (const pDto of productDtos) {
//     const product = productMap.get(pDto.productId);
//     if (!product)
//       throw new NotFoundException(
//         `Producto con ID ${pDto.productId} no encontrado.`,
//       );
//     if (product.stock < pDto.quantity) {
//       throw new BadRequestException(
//         `Stock insuficiente para ${product.name}. Stock disponible: ${product.stock}`,
//       );
//     }
//   }
// }

//

//
//
//
//

// import {
//   BadRequestException,
//   ForbiddenException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { DataSource } from 'typeorm';
// import { CreateOrderDto } from './dto/create-order.dto';
// import Stripe from 'stripe';
// import { Product } from '../temp-entities/product.placeholder.entity';
// import { Employee } from '../temp-entities/employee.placeholder.entity';
// import { Client } from '../temp-entities/client.placeholder.entity';
// import { Order } from '../temp-entities/order.placeholder.entity';
// import { OrderDetail } from '../temp-entities/orderDetail.placeholder.entity';
// import { TypeOfPayment } from '../temp-entities/typeOfPayment.placeholder.entity';

// @Injectable()
// export class OrdersService {
//   constructor(private readonly dataSource: DataSource) {}

//   async prepareOrderForCheckout(dto: CreateOrderDto) {
//     const { products, employeeId, email } = dto;

//     if (!products || products.length === 0) {
//       throw new BadRequestException(
//         'La orden debe contener al menos un producto.',
//       );
//     }

//     const employee = new Employee();
//     employee.id = employeeId;
//     if (!employee) throw new NotFoundException('Empleado no encontrado');

//     const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

//     for (const item of products) {
//       const product = new Product();
//       product.id = item.productId;
//       product.name = `Producto de Prueba ${item.productId}`;
//       product.price = 15.99;
//       product.stock = 100;

//       if (product.stock < item.quantity) {
//         throw new BadRequestException(
//           `Stock insuficiente para ${product.name}.`,
//         );
//       }

//       lineItems.push({
//         price_data: {
//           currency: 'usd',
//           product_data: { name: product.name },
//           unit_amount: Math.round(product.price * 100),
//         },
//         quantity: item.quantity,
//       });
//     }

//     const metadata = {
//       employeeId: employeeId,
//       clientEmail: email || '',
//       products: JSON.stringify(products),
//     };

//     return { lineItems, metadata };
//   }

//   async fulfillOrder(session: Stripe.Checkout.Session): Promise<Order> {
//     if (!session.metadata || session.amount_total === null) {
//       throw new Error('Faltan datos esenciales en la sesión de Stripe.');
//     }

//     const {
//       employeeId,
//       clientEmail,
//       products: productsJSON,
//     } = session.metadata;
//     const orderProducts: { productId: string; quantity: number }[] =
//       JSON.parse(productsJSON);

//     const typeOfPaymentSelected = new TypeOfPayment();
//     typeOfPaymentSelected.id = 2;
//     typeOfPaymentSelected.typeOfPayment = 'Tarjeta';

//     const employee = new Employee();
//     employee.id = employeeId;

//     let client: Client | null = null;
//     if (clientEmail) {
//       client = new Client();
//       client.id = 'clientFalso123';
//       client.email = clientEmail;
//     }

//     const order = new Order();
//     order.id = 'ordenFalsa1234';
//     order.employee = employee;
//     order.client = client;
//     //order.typeOfPayment = TypeOfPayment;
//     order.date = new Date();
//     order.totalOrder = session.amount_total / 100;
//     order.totalProducts = orderProducts.reduce(
//       (sum, item) => sum + item.quantity,
//       0,
//     );
//     order.stripeCheckoutSessionId = session.id;
//     order.details = [];

//     console.log('Orden creada:', order);

//     for (const item of orderProducts) {
//       const product = new Product();
//       product.id = item.productId;
//       product.name = `Producto Simulado ${item.productId}`;
//       product.price = 10.0;
//       product.stock = 50;

//       const newStock = product.stock - item.quantity;
//       if (newStock < 0) {
//         throw new Error(`Stock insuficiente para ${product.name}.`);
//       }

//       console.log(`Stock de ${product.name} actualizado a: ${newStock}`);

//       const detail = new OrderDetail();
//       detail.id = `detail-simulado-${Math.random()}`;
//       detail.order = order;
//       detail.price = product.price;
//       detail.product = product;
//       detail.totalAmountOfProducts = item.quantity;
//       detail.subtotalOrder = product.price * item.quantity;

//       order.details.push(detail);

//       console.log('Detalle de orden creado:', detail);
//     }

//     console.log(
//       `Orden ${order.id} creada exitosamente desde la sesión de Stripe ${session.id}`,
//     );

//     return order;
//   }

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
//}
