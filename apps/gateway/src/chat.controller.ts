import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ChatGrpcClient, FriendGrpcClient } from '@app/grpc';
import { CHAT_GRPC_SERVICE, FRIEND_GRPC_SERVICE } from './grpc.tokens';

@Controller('rooms')
export class ChatController {
  constructor(
    @Inject(CHAT_GRPC_SERVICE) private readonly chat: ChatGrpcClient,
    @Inject(FRIEND_GRPC_SERVICE) private readonly friend: FriendGrpcClient,
  ) {}

  /**
   * 룸 생성 시 요청 사용자와 초대 대상들이 친구인지 friend 서비스에 gRPC로 확인.
   *  - 실무에선 인증 컨텍스트에서 userId를 꺼내지만, 데모에선 body에서 수신
   */
  @Post()
  async createRoom(@Body() body: { userId: string; targetUserIds: string[] }) {
    const { result } = await firstValueFrom(
      this.friend.AreFriends({
        userId: body.userId,
        targetUserIds: body.targetUserIds,
      }),
    );
    if (result.some((ok) => !ok)) {
      return { error: 'not-all-friends', result };
    }
    return firstValueFrom(
      this.chat.CreateRoom({
        participantIds: [body.userId, ...body.targetUserIds],
      }),
    );
  }

  @Get(':id/messages')
  list(
    @Param('id') roomId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return firstValueFrom(
      this.chat.ListMessages({
        roomId,
        cursor,
        limit: limit ? Number(limit) : 30,
      }),
    );
  }
}
