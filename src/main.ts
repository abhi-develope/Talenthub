import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AllExceptionsFilter } from './utils/filters/all-exceptions.filter';
import { LoggingInterceptor } from './utils/interceptors/logging.interceptor';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error', 'debug', 'warn'],
  });

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable CORS for all origins
  app.enableCors();

  // Use global exception filter to log all exceptions
  app.useGlobalFilters(new AllExceptionsFilter());

  // Use global logging interceptor to log all requests/responses
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Use validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger setup (optional but good for development)
  const config = new DocumentBuilder()
    .setTitle('TalentHub API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document);

  // Use ConfigService if you're using @nestjs/config
  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT') || 3000;

 

  await app.listen(PORT);
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(` Swagger documentation available at http://localhost:${PORT}/api/swagger`);
}
bootstrap();
