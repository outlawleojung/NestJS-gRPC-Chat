import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ChatRoomEntity } from './entities/chat-room.entity';
import { ChatRoomMemberEntity } from './entities/chat-room-member.entity';
import { MessageEntity } from './entities/message.entity';
import { FriendshipEntity } from './entities/friendship.entity';

export const ALL_ENTITIES = [
  UserEntity,
  ChatRoomEntity,
  ChatRoomMemberEntity,
  MessageEntity,
  FriendshipEntity,
];

/**
 * 각 앱(account, chat)이 import 해서 재사용.
 *  - synchronize=true 는 데모용. 실제 서비스는 migration 사용
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST ?? '127.0.0.1',
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USER ?? 'chat',
        password: process.env.DB_PASSWORD ?? 'chat',
        database: process.env.DB_NAME ?? 'chat',
        entities: ALL_ENTITIES,
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
