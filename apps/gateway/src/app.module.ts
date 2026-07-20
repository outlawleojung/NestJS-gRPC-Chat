import { Module, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import {
  ACCOUNT_CLIENT_TOKEN,
  ACCOUNT_SERVICE,
  CHAT_CLIENT_TOKEN,
  CHAT_SERVICE,
  FRIEND_CLIENT_TOKEN,
  FRIEND_SERVICE,
} from '@app/common';
import {
  AccountGrpcClient,
  ChatGrpcClient,
  FriendGrpcClient,
  GrpcClientsModule,
} from '@app/grpc';
import { AccountController } from './account.controller';
import { ChatController } from './chat.controller';
import { FriendController } from './friend.controller';
import {
  ACCOUNT_GRPC_SERVICE,
  CHAT_GRPC_SERVICE,
  FRIEND_GRPC_SERVICE,
} from './grpc.tokens';

@Module({
  imports: [GrpcClientsModule],
  controllers: [AccountController, ChatController, FriendController],
  providers: [
    {
      provide: ACCOUNT_GRPC_SERVICE,
      inject: [ACCOUNT_CLIENT_TOKEN],
      useFactory: (client: ClientGrpc): AccountGrpcClient =>
        client.getService<AccountGrpcClient>(ACCOUNT_SERVICE),
    },
    {
      provide: CHAT_GRPC_SERVICE,
      inject: [CHAT_CLIENT_TOKEN],
      useFactory: (client: ClientGrpc): ChatGrpcClient =>
        client.getService<ChatGrpcClient>(CHAT_SERVICE),
    },
    {
      provide: FRIEND_GRPC_SERVICE,
      inject: [FRIEND_CLIENT_TOKEN],
      useFactory: (client: ClientGrpc): FriendGrpcClient =>
        client.getService<FriendGrpcClient>(FRIEND_SERVICE),
    },
  ],
  exports: [ACCOUNT_GRPC_SERVICE, CHAT_GRPC_SERVICE, FRIEND_GRPC_SERVICE],
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject(ACCOUNT_CLIENT_TOKEN) private readonly accountClient: ClientGrpc,
    @Inject(CHAT_CLIENT_TOKEN) private readonly chatClient: ClientGrpc,
    @Inject(FRIEND_CLIENT_TOKEN) private readonly friendClient: ClientGrpc,
  ) {}

  onModuleInit(): void {
    // gRPC clients are lazily connected on first call; nothing to do here.
    void this.accountClient;
    void this.chatClient;
    void this.friendClient;
  }
}
