import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // permite que el frontend acceda a la API desde cualquier origen
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONES', // permite estos métodos HTTP
    credentials: true, // permite enviar cookies y credenciales en las solicitudes
  });

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
