import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CHAT_PACKAGE, protoPath } from '@app/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: process.env.CHAT_GRPC_URL ?? '0.0.0.0:5002',
        package: CHAT_PACKAGE,
        protoPath: protoPath('chat.proto'),
      },
    },
  );
  await app.listen();
  // eslint-disable-next-line no-console
  console.log(
    `[chat] gRPC listening on ${process.env.CHAT_GRPC_URL ?? '0.0.0.0:5002'}`,
  );
}
bootstrap();
