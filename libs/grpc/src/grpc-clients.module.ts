import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  ACCOUNT_CLIENT_TOKEN,
  ACCOUNT_PACKAGE,
  CHAT_CLIENT_TOKEN,
  CHAT_PACKAGE,
  FRIEND_CLIENT_TOKEN,
  FRIEND_PACKAGE,
  protoPath,
} from '@app/common';

/**
 * Gateway 및 Realtime-Hub가 사용하는 gRPC 클라이언트 모음.
 *  - ACCOUNT_GRPC_URL, CHAT_GRPC_URL 을 .env로 주입
 */
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: ACCOUNT_CLIENT_TOKEN,
        useFactory: () => ({
          transport: Transport.GRPC,
          options: {
            url: process.env.ACCOUNT_GRPC_URL ?? '0.0.0.0:5001',
            package: ACCOUNT_PACKAGE,
            protoPath: protoPath('account.proto'),
          },
        }),
      },
      {
        name: CHAT_CLIENT_TOKEN,
        useFactory: () => ({
          transport: Transport.GRPC,
          options: {
            url: process.env.CHAT_GRPC_URL ?? '0.0.0.0:5002',
            package: CHAT_PACKAGE,
            protoPath: protoPath('chat.proto'),
          },
        }),
      },
      {
        name: FRIEND_CLIENT_TOKEN,
        useFactory: () => ({
          transport: Transport.GRPC,
          options: {
            url: process.env.FRIEND_GRPC_URL ?? '0.0.0.0:5003',
            package: FRIEND_PACKAGE,
            protoPath: protoPath('friend.proto'),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class GrpcClientsModule {}
