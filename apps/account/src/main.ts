import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ACCOUNT_PACKAGE, protoPath } from '@app/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: process.env.ACCOUNT_GRPC_URL ?? '0.0.0.0:5001',
        package: ACCOUNT_PACKAGE,
        protoPath: protoPath('account.proto'),
        loader: { longs: String, enums: String },
      },
    },
  );
  await app.listen();
  // eslint-disable-next-line no-console
  console.log(
    `[account] gRPC listening on ${process.env.ACCOUNT_GRPC_URL ?? '0.0.0.0:5001'}`,
  );
}
bootstrap();
