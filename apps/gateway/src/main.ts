import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.GATEWAY_HTTP_PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[gateway] HTTP listening on http://localhost:${port}`);
}
bootstrap();
