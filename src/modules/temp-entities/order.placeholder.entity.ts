import { Employee } from './employee.placeholder.entity';
import { Client } from './client.placeholder.entity';
import { TypeOfPayment } from './typeOfPayment.placeholder.entity';
import { OrderDetail } from './orderDetail.placeholder.entity';

export class Order {
  id: string; // uuid
  order: string;
  totalProducts: number;
  totalOrder: number;
  date: Date;
  time: string;
  activo: number;
  //relaciones
  employee: Employee;
  client: Client | null;
  typeOfPayment: TypeOfPayment;
  details: OrderDetail[];

  stripeCheckoutSessionId: string;
}
