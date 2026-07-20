import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  CHAT_CLIENT_TOKEN,
  CHAT_SERVICE,
} from '@app/common';
import { ChatGrpcClient, GrpcClientsModule } from '@app/grpc';
import { NatsModule } from '@app/nats';
import { RedisModule } from '@app/redis';
import { RealtimeGateway } from './realtime.gateway';
import { CHAT_GRPC_SERVICE } from './grpc.tokens';

@Module({
  imports: [GrpcClientsModule, NatsModule, RedisModule],
  providers: [
    RealtimeGateway,
    {
      provide: CHAT_GRPC_SERVICE,
      inject: [CHAT_CLIENT_TOKEN],
      useFactory: (client: ClientGrpc): ChatGrpcClient =>
        client.getService<ChatGrpcClient>(CHAT_SERVICE),
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(@Inject(CHAT_CLIENT_TOKEN) private readonly chatClient: ClientGrpc) {}
  onModuleInit(): void {
    void this.chatClient; // lazy connect on first call
  }
}
