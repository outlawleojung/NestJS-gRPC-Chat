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

/** proto-loader가 int64/uint64 등을 JS Number 대신 문자열로 변환하도록 */
const loader = { longs: String, enums: String };

/**
 * Gateway 및 Realtime-Hub가 사용하는 gRPC 클라이언트 모음.
 *  - ACCOUNT_GRPC_URL, CHAT_GRPC_URL, FRIEND_GRPC_URL 을 .env로 주입
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
            loader,
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
            loader,
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
            loader,
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class GrpcClientsModule {}
