import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RoleSeeder } from './modules/roles/role.seeder';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);

  const seeder = appContext.get(RoleSeeder);

  try {
    console.log('Seeding initial data...');
    await seeder.seed();
    console.log('Seeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await appContext.close();
  }
}

bootstrap();
