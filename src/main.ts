import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get configuration service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  const fileMaxSize = configService.get<number>('app.file.maxSize', 5000000);

  // Security: Helmet
  app.use(helmet.default());

  // CORS
  app.enableCors({
    origin: '*', // Configure this for production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger / OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('ZAK KYC API')
    .setDescription(
      'ZAK KYC System API - Single endpoint for KYC validation with complete user information (personal data, selfie, and document photo). Automatically registers users and validates with RENAPER integration, generating ZK proofs for privacy-preserving verification.',
    )
    .setVersion('3.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API Key for authentication (required for /auth/token endpoint)',
      },
      'x-api-key',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /auth/token endpoint',
      },
      'bearer',
    )
    .addTag('Authentication', 'API Key and JWT token management')
    .addTag(
      'KYC',
      'KYC validation endpoint - Submit complete user information (wallet, personal data, email) with selfie and document photo. Automatically registers users if not exists and validates with RENAPER.',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'ZAK KYC API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  console.log('========================================');
  console.log('🚀 ZAK KYC Backend Starting...');
  console.log('========================================');
  console.log(`📝 Environment: ${configService.get('app.nodeEnv')}`);
  console.log(`🔐 API Keys loaded: ${configService.get<string[]>('app.apiKeys').length}`);
  console.log(`📄 Max file size: ${(fileMaxSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`🌐 Port: ${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  console.log('========================================');

  await app.listen(port);
}

bootstrap();
