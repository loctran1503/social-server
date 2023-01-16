import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import 'dotenv/config'
import { isProduction } from './util/constants';
async function bootstrap() {
  const logger = new Logger('Main (main.ts)');
  const app = await NestFactory.create(AppModule,{cors:{
    origin:isProduction ? process.env.CORS_PROD : process.env.CORS_DEV,
    credentials:true,
  }
});
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.setGlobalPrefix('social/api')
  
  
  await app.listen(4445);
  logger.log(`Server running on port ${4445}`);
}
bootstrap();
