import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';
import cookieParser = require('cookie-parser');

const server: Express = express();
let isAppInitialized = false;

async function createNestServer(expressInstance: Express) {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

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

  await app.init();
  return app;
}

// Handler serverless para Vercel
const handler = async (req: any, res: any) => {
  if (!isAppInitialized) {
    await createNestServer(server);
    isAppInitialized = true;
  }
  return server(req, res);
};

// Si corre en local fuera de Vercel
if (!process.env.VERCEL) {
  createNestServer(server).then((app) => {
    app.listen(process.env.PORT || 3000);
  });
}

// Exportación doble obligatoria para evitar el error "No exports found"
module.exports = handler;
module.exports.default = handler;
export default handler;