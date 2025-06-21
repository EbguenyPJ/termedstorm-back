import {
  Injectable,
  Logger,
  OnModuleDestroy,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { CustomerService } from '../../master_data/customer/customer.service';
import { tenantDbConfigTemplate } from '../../config/typeorm'; //% plantilla de configuración del tenant
import { getTenantContext } from '../context/tenant-context'; //% Importa el contexto del tenant
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

@Injectable()
export class TenantConnectionService implements OnModuleDestroy {
  private readonly logger = new Logger(TenantConnectionService.name);
  private readonly dataSources: Map<string, DataSource> = new Map();

  constructor(private readonly customerService: CustomerService) {}

  /**
   * Obtiene o crea una conexión a la base de datos para un cliente específico.
   * @param customerId id de zapateria
   * @returns instancia de typeorm datasource.
   */
  async getTenantDataSource(customerId: string): Promise<DataSource> {
    // Buscar si ya existe una conexión para ese tenant
    const cachedDataSource = this.dataSources.get(customerId);

    if (cachedDataSource) {
      if (cachedDataSource.isInitialized) {
        return cachedDataSource;
      }

      this.logger.warn(
        `DataSource for customer ${customerId} found but not initialized. Reinitializing.`,
      );
      try {
        await cachedDataSource.initialize();
        return cachedDataSource;
      } catch (error) {
        this.logger.error(
          `Failed to reinitialize DataSource for customer ${customerId}: ${error.message}`,
        );
        this.dataSources.delete(customerId);
        throw new InternalServerErrorException(
          `Could not connect to tenant database.`,
        );
      }
    }

    // Si no existe conexión previa, buscar datos del cliente en la masterDB
    const customer = await this.customerService.findOne(customerId);
    if (!customer) {
      this.logger.error(
        `Customer with ID ${customerId} not found in master database.`,
      );
      throw new NotFoundException(`Customer not found.`);
    }

    const tenantOptions: PostgresConnectionOptions = {
      ...(tenantDbConfigTemplate as PostgresConnectionOptions),
      url: customer.db_connection_string,
      name: customerId,
    };

    const newDataSource = new DataSource(tenantOptions);

    try {
      await newDataSource.initialize();
      this.dataSources.set(customerId, newDataSource);
      this.logger.log(
        `New DataSource created and initialized for customer ${customerId}`,
      );
      return newDataSource;
    } catch (error) {
      this.logger.error(
        `Failed to initialize new DataSource for customer ${customerId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Could not connect to tenant database.`,
      );
    }
  }

  //% Obtiene la conexión a la base de datos del tenant actual desde el contexto.
  //% Útil para servicios que necesitan la conexión actual sin saber el id del cliente.
  getTenantDataSourceFromContext(): DataSource {
    const context = getTenantContext();
    if (!context || !context.customerId) {
      throw new InternalServerErrorException(
        'Tenant context not set. Cannot get tenant data source.',
      );
    }
    const dataSource = this.dataSources.get(context.customerId);
    if (!dataSource || !dataSource.isInitialized) {
      throw new InternalServerErrorException(
        `Tenant DataSource for ${context.customerId} is not initialized or found.`,
      );
    }
    return dataSource;
  }

  //% cierra todas las conexiones de bases de datos de tenants cuando la aplicación se cierra.
  async onModuleDestroy() {
    this.logger.log('Closing all tenant DataSources...');
    for (const [customerId, dataSource] of this.dataSources.entries()) {
      if (dataSource.isInitialized) {
        await dataSource.destroy();
        this.logger.log(`DataSource for customer ${customerId} destroyed.`);
      }
    }
    this.dataSources.clear();
  }
}
