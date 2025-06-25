import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Employee } from 'src/modules/users/entities/employee.entity'; 
import { Audit } from 'src/audits/audit.entity'; 

@Entity('tw_cortes')
export class Cut {
  @PrimaryGeneratedColumn({ name: 'id_corte' })
  id: number;

  @Column({ name: 'd_fecha_corte', type: 'date' })
  date: string;

  @Column({ name: 't_hora_corte', type: 'time' })
  time: string;

  @Column({ name: 'n_cantidad_arqueos', type: 'int' })
  auditCount: number;

  @Column({
    name: 'n_total_arqueos',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalAudits: number;

  @Column({ name: 'n_cantidad_ventas', type: 'int' })
  saleCount: number;

  @Column({
    name: 'n_total_ventas_dinero',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalCashSales: number;

  @Column({ name: 's_descripcion', type: 'varchar', length: 255 })
  description: string;

  @Column({ name: 'n_cantidad_gastos', type: 'int' })
  expenseCount: number;

  @Column({
    name: 'n_total_gastos',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalExpenses: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'id_empleado' })
  employee: Employee;
  
   @Column({ name: 'id_empleado', type: 'uuid' })
  employeeId: string;

  @OneToMany(() => Audit, (audit) => audit.cut)
  audits: Audit[];

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
