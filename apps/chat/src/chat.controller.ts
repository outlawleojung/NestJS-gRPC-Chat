import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CHAT_SERVICE } from '@app/common';
import { ChatRoomEntity, MessageEntity } from '@app/entity';
import { ChatService } from './chat.service';

function toRoomDto(room: ChatRoomEntity) {
  return {
    id: room.id,
    participantIds: (room.members ?? []).map((m) => m.userId),
    createdAt: room.createdAt.getTime().toString(),
  };
}

function toMessageDto(m: MessageEntity) {
  return {
    id: m.id,
    roomId: m.roomId,
    senderId: m.senderId,
    content: m.content,
    createdAt: m.createdAt.getTime().toString(),
  };
}

@Controller()
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @GrpcMethod(CHAT_SERVICE, 'CreateRoom')
  async createRoom(data: { participantIds: string[] }) {
    const room = await this.chat.createRoom(data.participantIds);
    return {
      ...toRoomDto(room),
      participantIds: data.participantIds,
    };
  }

  @GrpcMethod(CHAT_SERVICE, 'ListMessages')
  async listMessages(data: { roomId: string; cursor?: string; limit?: number }) {
    const { items, nextCursor } = await this.chat.listMessages(
      data.roomId,
      data.cursor,
      data.limit ?? 30,
    );
    return { messages: items.map(toMessageDto), nextCursor };
  }

  @GrpcMethod(CHAT_SERVICE, 'SaveMessage')
  async saveMessage(data: { roomId: string; senderId: string; content: string }) {
    const m = await this.chat.saveAndPublish(data.roomId, data.senderId, data.content);
    return toMessageDto(m);
  }
}
