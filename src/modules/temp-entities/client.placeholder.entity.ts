import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Client {
  @PrimaryGeneratedColumn('increment') // O 'uuid' si usas UUIDs
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({
    name: 'stripe_customer_id',
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  stripeCustomerId: string;

  @Column({
    name: 'stripe_subscription_id',
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  stripeSubscriptionId: string;

  @Column({
    name: 'subscription_status',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  subscriptionStatus: string; // si esta activa impaga o como
}
