import { Order } from './order.placeholder.entity';
import { Product } from './product.placeholder.entity';

export class OrderDetail {
  id: string; // uuid
  price: number;
  totalAmountOfProducts: number;
  subtotalOrder: number;
  activo: number;

  // relaciones
  order: Order;
  product: Product;
}
