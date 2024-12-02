import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with default settings (allows all origins)
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
