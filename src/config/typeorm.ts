import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

const tenantDbConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  // entities: ['dist/**/*.entity{.ts,.js}'],
  // entities: [__dirname + '/../**/*.entity.{ts,js}'],
  // migrations: ['dist/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  dropSchema: true,
  synchronize: true,
};




// --- Configuración para la Base de Datos MAESTRA ---
import { Customer } from '../master_data/customer/entities/customer.entity';
import { CompanySubscription } from '../master_data/company_subscription/entities/company-subscription.entity';
import { GlobalMembershipType } from '../master_data/global_membership_type/entities/global-membership-type.entity';

export const masterDbConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.MASTER_DB_HOST || 'localhost',
  port: parseInt(process.env.MASTER_DB_PORT || '5432', 10),
  username: process.env.MASTER_DB_USERNAME || 'postgres',
  password: process.env.MASTER_DB_PASSWORD || '',
  database: process.env.MASTER_DB_DATABASE || '',
  entities: [Customer, CompanySubscription, GlobalMembershipType],
  dropSchema: true,
  synchronize: true,
  name: 'masterConnection',
};

// export const typeormConfig = config;
// export default registerAs('typeorm', () => config);

// export default registerAs('typeorm', () => tenantDbConfig);

export const typeormConfig = tenantDbConfig;
export default registerAs('typeorm', () => typeormConfig);

