import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

const config = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  entities: ['dist/**/*.entity{.ts,.js}'],
  // entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
<<<<<<< HEAD
  dropSchema: false,
=======
  dropSchema: true,
>>>>>>> cd8e4efefb8e00c312b3b8229db8eb2d2494dd20
  synchronize: true,
};

export const typeormConfig = config;
export default registerAs('typeorm', () => config);
