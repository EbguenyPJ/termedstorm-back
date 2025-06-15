import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loggerGlobal } from './middlewares/logger.middleware';
import { ValidationPipe } from '@nestjs/common';
<<<<<<< HEAD
import * as cookieParser from 'cookie-parser';
=======
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
>>>>>>> cd8e4efefb8e00c312b3b8229db8eb2d2494dd20

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.use(loggerGlobal);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
<<<<<<< HEAD
  app.use(cookieParser());
=======

const swaggerConfig = new DocumentBuilder()
    .setTitle('NIVO POS API')
    .setVersion('1.0.0')
    .setDescription(
      'Esta es la documentación del proyecto final **API Nivo**, una aplicación web de punto de venta (POS) diseñada para gestionar productos, categorías, marcas, subcategorías, usuarios, auditorías y operaciones de venta. La API permite realizar operaciones CRUD seguras, validar relaciones entre entidades y mantener registros detallados para control administrativo.',
    )
    .addBearerAuth()
    .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);

>>>>>>> cd8e4efefb8e00c312b3b8229db8eb2d2494dd20
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
