import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin:['http://localhost:4200','https://tp2-socialite.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // permite estos métodos HTTP
    credentials: true, // permite enviar cookies y credenciales en las solicitudes
  });
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trusty proxy', 1)

  app.use(cookieParser());

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
