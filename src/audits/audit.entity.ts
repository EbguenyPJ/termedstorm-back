
 import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   ManyToOne,
   JoinColumn,
   UpdateDateColumn,
   DeleteDateColumn,
   CreateDateColumn,
 } from 'typeorm';
 import { Cut } from 'src/cuts/cut.entity';
import { Employee } from 'src/modules/users/entities/employee.entity';

@Entity('tw_arqueos')
 export class Audit {
   @PrimaryGeneratedColumn({ name: 'id_arqueo' })
   id: number;

   @Column({ name: 'total_ventas_efectivo', type: 'decimal', precision: 10, scale: 2 })
   totalCashSales: number;

   @Column({ name: 'total_ventas_tarjeta', type: 'decimal', precision: 10, scale: 2 })
   totalCardSales: number;

   @Column({ name: 'total_ventas_transferencia', type: 'decimal', precision: 10, scale: 2 })
   totalTransferSales: number;

   @Column({ name: 'n_cantidad_ventas', type: 'int' })
   saleCount: number;

   @Column({ name: 'n_total_efectivo', type: 'decimal', precision: 10, scale: 2 })
   totalCash: number;

   @Column({ name: 's_descripcion', type: 'varchar', length: 255 })
   description: string;


   @Column({ name: 'd_fecha_arqueo', type: 'date' })
  date: string;

  @Column({ name: 't_hora_arqueo', type: 'time' })
  time: string;


   @ManyToOne(() => Employee, { eager: true })
   @JoinColumn({ name: 'id_empleado' })
   employee: Employee;

   @ManyToOne(() => Cut, (cut) => cut.audits, { nullable: true })
   @JoinColumn({ name: 'id_corte' })
   cut: Cut;



   @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
   updatedAt: Date;

   @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
   deletedAt?: Date;
 }
