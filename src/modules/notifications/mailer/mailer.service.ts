import { Injectable } from '@nestjs/common';
import { MailerService as BaseMailerService } from '@nestjs-modules/mailer';
import { User } from 'src/modules/users/entities/user.entity';
import { Client } from 'src/modules/users/entities/client.entity';
import { Employee } from 'src/modules/users/entities/employee.entity';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: BaseMailerService) {}

  async sendMail(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });
      console.log('[MAILER SERVICE] Correo enviado exitosamente a:', to);
    } catch (err) {
      console.error('[MAILER SERVICE ERROR]', err.message, err.stack);
    }
  }

  async sendLowStockNotification(
    userEmail: string,
    context: Record<string, any>,
  ) {
    await this.sendMail(userEmail, 'Low stock alert!', 'low-stock', context);
  }

  async sendWelcomeEmailToEmployee(employee: Employee) {
    await this.sendMail(
      employee.user.email,
      '¡Bienvenido a Nivo!',
      'welcome-employee',
      {
        name: `${employee.user.first_name} ${employee.user.last_name}`,
      },
    );
  }

  async sendWelcomeEmailToClient(client: Client) {
    await this.sendMail(
      client.user.email,
      '¡Bienvenido a nuestra tienda!',
      'welcome-client',
      {
        name: `${client.user.first_name} ${client.user.last_name}`,
      },
    );
  }

  async sendLoginNotificationToEmployee(employee: Employee) {
    const name = `${employee.user.first_name} ${employee.user.last_name}`;
    const now = new Date().toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    await this.sendMail(
      employee.user.email,
      'Inicio de sesión en tu cuenta de empleado',
      'login-employee',
      {
        name,
        loginTime: now,
      },
    );
  }

  async sendLoginNotificationToClient(client: Client) {
    const name = `${client.user.first_name} ${client.user.last_name}`;
    const now = new Date().toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    await this.sendMail(
      client.user.email,
      'Inicio de sesión en tu cuenta',
      'login-client',
      {
        name,
        loginTime: now,
      },
    );
  }
}
