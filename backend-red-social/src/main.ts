import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import cookieParser = require('cookie-parser');

let app: INestApplication;

async function bootstrap(): Promise<INestApplication> {
  if (!app) {
    app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: [
        'http://localhost:4200',
        'https://tp2-socialite.vercel.app',
        'http://localhost:8080',
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);

    app.use(cookieParser());

    // En Vercel solo inicializamos la app; en local escuchamos el puerto
    if (process.env.VERCEL) {
      await app.init();
    } else {
      await app.listen(process.env.PORT || 3000);
    }
  }
  return app;
}

// Para desarrollo local (npm run start:dev)
if (!process.env.VERCEL) {
  bootstrap();
}

// Handler serverless que exige Vercel
export default async function handler(req: any, res: any) {
  const nestApp = await bootstrap();
  const instance = nestApp.getHttpAdapter().getInstance();
  return instance(req, res);
}