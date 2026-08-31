import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import cookieParser from 'cookie-parser';

let app: any;

async function bootstrap() {
  if (!app) {
    const nestApp = await NestFactory.create(AppModule);

    nestApp.enableCors({
      origin: [
        'http://localhost:4200',
        'https://tp2-socialite.vercel.app',
        'http://localhost:8080',
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    const expressApp = nestApp.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);

    nestApp.use(cookieParser());

    await nestApp.init();
    app = expressApp;
  }
  return app;
}

// Exportación compatible con CommonJS para Vercel
export default async (req: any, res: any) => {
  const server = await bootstrap();
  return server(req, res);
};