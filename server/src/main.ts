import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const SWAGGER_SCHEMES: Array<'http'|'https'> = ['http', 'https'];
const SWAGGER_PUBLIC_PATH = 'swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Filecabinet')
    .setBasePath('/')
    .setDescription('')
    .setSchemes(...SWAGGER_SCHEMES)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(SWAGGER_PUBLIC_PATH, app, document);

  app.enableCors({});
  await app.listen(3000);
}
bootstrap();
