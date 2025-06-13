import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';

import { Product } from 'src/modules/temp-entities/product.placeholder.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import { OrderDetail } from 'src/modules/orders/entities/orderDetail.entity';
import { Client } from 'src/modules/temp-entities/client.placeholder.entity';
import { Employee } from 'src/modules/temp-entities/employee.placeholder.entity';
import { TypeOfPayment } from 'src/modules/type-of-payment/type-of-payment.entity';
import { Cut } from 'src/cuts/cut.entity';

dotenvConfig({ path: '.env' });

const config = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  entities: [Product, Order, OrderDetail, Client, Employee, TypeOfPayment,Cut],
  migrations: ['dist/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  // dropSchema: true,
  //synchronize: true,
};

export default registerAs('typeorm', () => config);
