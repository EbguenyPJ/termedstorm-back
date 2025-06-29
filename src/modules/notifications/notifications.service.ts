import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { MailerService } from './mailer/mailer.service';
import { NotificationType } from './types/notification-type.enum';
import { Client } from 'src/modules/users/entities/client.entity';
import { Employee } from 'src/modules/users/entities/employee.entity';
import { Customer } from 'src/master_data/customer/entities/customer.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { VariantSize } from '../variantSIzes/entities/variantSizes.entity';
import { ProductVariant } from '../productsVariant/entities/product-variant.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly mailerService: MailerService,
  ) {}

  async sendNotification(options: {
    type: NotificationType;
    title: string;
    message: string;
    client?: Client;
    employee?: Employee;
    customer?: Customer;
    sendEmail?: boolean;
    emailTemplate?: string;
    emailContext?: Record<string, any>;
  }) {
    const notification = this.notificationRepository.create({
      type: options.type,
      title: options.title,
      message: options.message,
      client: options.client,
      employee: options.employee,
      customer: options.customer,
      sent_by_email: !!options.sendEmail,
    });

    await this.notificationRepository.save(notification);

    if (options.sendEmail && options.emailTemplate) {
      const to =
        options.client?.user?.email ||
        options.employee?.user?.email ||
        options.customer?.email;

      const name =
        options.client?.user?.first_name ||
        options.employee?.user?.first_name ||
        options.customer?.name ||
        'Usuario';

      if (to) {
        await this.mailerService.sendMail(
          to,
          options.title,
          options.emailTemplate,
          {
            ...options.emailContext,
            name,
          }
        );
      } else {
        console.warn('No se pudo enviar email: destinatario no definido');
      }
    }

    return notification;
  }

  // Para un solo producto
  async notifyIfLowStock(variantSize: VariantSize) {
    if (variantSize.stock >= 5) return;

    const product = variantSize.variantProduct?.product;
    const employee = product?.employee;

    if (!product || !employee?.user?.email) return;

    await this.sendNotification({
      type: NotificationType.PRODUCT_LOW_STOCK,
      title: 'Producto con stock bajo',
      message: `El producto "${product.name}" tiene poco stock.`,
      employee,
      sendEmail: true,
      emailTemplate: 'stock-low-single',
      emailContext: {
        productName: product.name,
        stockLeft: variantSize.stock,
        productUrl: `https://nivo.com/products/${product.slug}`,
        productImage: variantSize.variantProduct.image?.[0] || '',
      },
    });
  }

  // Para varios productos (usado por el CRON)
  async notifyLowStockMultiple(variants: VariantSize[]) {
    const grouped = new Map<string, { employee: Employee; variants: VariantSize[] }>();

    for (const v of variants) {
      const emp = v.variantProduct.product.employee;
      if (!emp?.user?.email) continue;

      if (!grouped.has(emp.id)) {
        grouped.set(emp.id, { employee: emp, variants: [] });
      }
      grouped.get(emp.id)?.variants.push(v);
    }

    for (const { employee, variants } of grouped.values()) {
      await this.sendNotification({
        type: NotificationType.PRODUCT_LOW_STOCK,
        title: 'Productos con stock bajo',
        message: `Tienes ${variants.length} productos con stock bajo.`,
        employee,
        sendEmail: true,
        emailTemplate: 'stock-low-multiple',
        emailContext: {
          products: variants.map((v) => ({
            name: v.variantProduct.product.name,
            stock: v.stock,
          })),
        },
      });
    }
  }
}
