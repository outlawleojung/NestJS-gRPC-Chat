import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { FRIEND_PACKAGE, protoPath } from '@app/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: process.env.FRIEND_GRPC_URL ?? '0.0.0.0:5003',
        package: FRIEND_PACKAGE,
        protoPath: protoPath('friend.proto'),
      },
    },
  );
  await app.listen();
  // eslint-disable-next-line no-console
  console.log(
    `[friend] gRPC listening on ${process.env.FRIEND_GRPC_URL ?? '0.0.0.0:5003'}`,
  );
}
bootstrap();
