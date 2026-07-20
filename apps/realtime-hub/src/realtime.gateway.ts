import {
  Inject,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { firstValueFrom } from 'rxjs';
import {
  chatRoomMessageSubjectPattern,
  NatsService,
} from '@app/nats';
import { RedisService } from '@app/redis';
import { ChatGrpcClient } from '@app/grpc';
import { CHAT_GRPC_SERVICE } from './grpc.tokens';

interface JoinPayload {
  userId: string;
  roomId: string;
}

interface SendPayload {
  userId: string;
  roomId: string;
  content: string;
}

/**
 * Realtime Hub — 다중 Pod로 확장 가능한 Socket.IO 서버
 *
 *  Pod A                   NATS                   Pod B
 *  ─────                  ─────                  ─────
 *  socket ─► send  ─► chat gRPC (SaveMessage)
 *                          │
 *                          │ NATS publish  chat.room.{roomId}.message
 *                          ▼
 *  ◄─────── subscribe ──────┴──────── subscribe ─────►
 *  socket ◄─ emit                            socket ◄─ emit
 */
@WebSocketGateway({ cors: { origin: '*' } })
export class RealtimeGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly nats: NatsService,
    private readonly redis: RedisService,
    @Inject(CHAT_GRPC_SERVICE) private readonly chat: ChatGrpcClient,
  ) {}

  onModuleInit(): void {
    // 모든 룸의 메시지 이벤트를 구독 → 자신에게 연결된 소켓에만 emit
    this.nats.subscribe<{
      id: string;
      roomId: string;
      senderId: string;
      content: string;
      seqId: number;
      createdAt: string;
    }>(chatRoomMessageSubjectPattern, (payload) => {
      // Socket.IO room = "room:{roomId}" 규칙
      this.server.to(`room:${payload.roomId}`).emit('message', payload);
    });
  }

  handleConnection(socket: Socket): void {
    this.logger.log(`socket connected: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    this.logger.log(`socket disconnected: ${socket.id}`);
    // Redis에서 이 소켓의 참여 정보를 정리하려면 socket.data에서 조회
  }

  @SubscribeMessage('join')
  async onJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: JoinPayload,
  ): Promise<{ ok: true }> {
    socket.data.userId = body.userId;
    await socket.join(`room:${body.roomId}`);
    await this.redis.addRoomMember(body.roomId, body.userId);
    return { ok: true };
  }

  @SubscribeMessage('send')
  async onSend(@MessageBody() body: SendPayload): Promise<{ ok: true }> {
    // chat 서비스에 gRPC로 저장 요청 → chat 서비스가 NATS publish 함
    // (Realtime-Hub는 publish를 subscribe로 받아서 다시 emit)
    await firstValueFrom(
      this.chat.SaveMessage({
        roomId: body.roomId,
        senderId: body.userId,
        content: body.content,
      }),
    );
    return { ok: true };
  }
}
