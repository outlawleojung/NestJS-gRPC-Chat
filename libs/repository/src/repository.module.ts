import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ChatRoomEntity,
  ChatRoomMemberEntity,
  FriendshipEntity,
  MessageEntity,
  UserEntity,
} from '@app/entity';
import { UserRepository } from './user.repository';
import { ChatRoomRepository } from './chat-room.repository';
import { ChatRoomMemberRepository } from './chat-room-member.repository';
import { MessageRepository } from './message.repository';
import { FriendshipRepository } from './friendship.repository';

/**
 * 각 앱에서 필요한 엔티티만 forFeature 로 다시 등록해 사용.
 * 여기선 모든 리포지토리 provider를 한번에 export.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ChatRoomEntity,
      ChatRoomMemberEntity,
      MessageEntity,
      FriendshipEntity,
    ]),
  ],
  providers: [
    UserRepository,
    ChatRoomRepository,
    ChatRoomMemberRepository,
    MessageRepository,
    FriendshipRepository,
  ],
  exports: [
    UserRepository,
    ChatRoomRepository,
    ChatRoomMemberRepository,
    MessageRepository,
    FriendshipRepository,
  ],
})
export class RepositoryModule {}
