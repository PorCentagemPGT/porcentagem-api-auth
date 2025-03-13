import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validação global de DTOs com regras mais rigorosas
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Habilita CORS para integração com o frontend
  app.enableCors();

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Porcentagem API Auth')
    .setDescription(
      `API de autenticação do sistema Porcentagem.
      
      Esta API é responsável por:
      - Geração de tokens JWT para acesso aos recursos
      - Gerenciamento de sessões ativas
      - Validação de tokens
      - Refresh de tokens expirados
      
      A autenticação é feita usando:
      - Access Token JWT (curta duração - 15min)
      - Refresh Token (longa duração - 7 dias)
      
      Para acessar endpoints protegidos, envie o access token no header:
      \`Authorization: Bearer seu-token-aqui\`
      
      Quando o access token expirar, use o refresh token no endpoint
      \`POST /auth/refresh\` para obter um novo par de tokens.`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o access token JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Configuração da porta
  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger documentation is available at: http://localhost:${port}/docs`,
  );
}

// Executa o bootstrap com tratamento de erros
bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});
