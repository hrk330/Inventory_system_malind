import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { loggerConfig } from './config/logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: loggerConfig,
  });

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  const corsOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000'];
    
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // Global exception filters
  app.useGlobalFilters(new AllExceptionsFilter(), new ValidationExceptionFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Inventory Management API')
    .setDescription('Complete Stock Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
