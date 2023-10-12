import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap'); // para evitar el tipo console.log y seguir el modelo los logs de NEST

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Teslo RESTFul API')
    .setDescription('Teslo shop endpoints')
    .setVersion('1.0')
    // .addTag('cats') // ciertos agrupadores, como autenticacion, carga de archivos, seeds, etc
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // se crea en el endpoint api, mnada la app, y nuestro documento ya configurado
  
  await app.listen(process.env.PORT);
  logger.log(`App running on port ${ process.env.PORT }`);
  
}
bootstrap();
