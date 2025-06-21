import { Module, Global } from '@nestjs/common';
import { TenantConnectionService } from './tenant-connection.service';
import { CustomerModule } from '../../master_data/customer/customer.module'; //% Necesita el CustomerService

@Global() //% hace este módulo global para que el TenantConnectionService pueda ser inyectado en cualquier parte
@Module({
  imports: [CustomerModule], //% importa customermodule para acceder a customerservice
  providers: [TenantConnectionService],
  exports: [TenantConnectionService], //% exporta el servicio para que otros módulos lo usen
})
export class TenantConnectionModule {}
