import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from "cookie-parser";
import * as session from 'express-session';
import passport from 'passport';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true
    }
  }));
  /*app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );*/
  app.enableCors();
  app.use(cookieParser());
 // app.use(passport.session());
  await app.listen(process.env.APP_PORT);
}
bootstrap();

