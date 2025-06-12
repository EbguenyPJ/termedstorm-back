import { Column } from 'typeorm';

export enum EmployeeRole {
  ADMIN = 'admin',
  VENDEDOR = 'vendedor',
}

export class Employee {
  id: string;
  name: string;
  email: string;

  @Column({
    type: 'enum',
    enum: EmployeeRole,
    default: EmployeeRole.VENDEDOR,
  })
  role: EmployeeRole;

  // El admin que paga tendrá estos campos. Los demás empleados de la misma empresa
  // se beneficiarían de esta suscripción. // como diferenciamos user de admin. PUse enum  ???
  @Column({ name: 'stripe_customer_id', nullable: true, unique: true })
  stripeCustomerId: string;

  @Column({ name: 'stripe_subscription_id', nullable: true, unique: true })
  stripeSubscriptionId: string;

  @Column({ name: 'subscription_status', nullable: true })
  subscriptionStatus: string;
}
