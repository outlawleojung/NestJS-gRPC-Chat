import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.REALTIME_HUB_WS_PORT ?? 3100);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(
    `[realtime-hub] Socket.IO listening on http://localhost:${port}  (path: /socket.io)`,
  );
}
bootstrap();
