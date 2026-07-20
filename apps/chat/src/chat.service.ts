import { Injectable } from '@nestjs/common';
import {
  ChatRoomMemberRepository,
  ChatRoomRepository,
  MessageRepository,
} from '@app/repository';
import { chatRoomMessageSubject, NatsService } from '@app/nats';
import { ChatRoomEntity, MessageEntity } from '@app/entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly rooms: ChatRoomRepository,
    private readonly members: ChatRoomMemberRepository,
    private readonly messages: MessageRepository,
    private readonly nats: NatsService,
  ) {}

  async createRoom(participantIds: string[]): Promise<ChatRoomEntity> {
    const room = await this.rooms.createAndSave({});
    await Promise.all(
      participantIds.map((userId) =>
        this.members.createAndSave({ roomId: room.id, userId }),
      ),
    );
    return room;
  }

  listMessages(roomId: string, cursor: string | undefined, limit: number) {
    return this.messages.listByRoom(roomId, cursor, Math.max(1, Math.min(limit, 100)));
  }

  /**
   * 메시지 저장 후 NATS로 Publish.
   *  - Realtime-Hub(모든 Pod)가 이 subject를 구독하고 있으므로
   *    자신에게 연결된 사용자 소켓으로 전달함
   */
  async saveAndPublish(
    roomId: string,
    senderId: string,
    content: string,
  ): Promise<MessageEntity> {
    const seqId = await this.rooms.incrementSeq(roomId);
    const message = await this.messages.createAndSave({
      roomId,
      senderId,
      seqId,
      content,
    });

    this.nats.publish(chatRoomMessageSubject(roomId), {
      id: message.id,
      roomId,
      senderId,
      content,
      seqId,
      createdAt: message.createdAt.toISOString(),
    });

    return message;
  }
}
