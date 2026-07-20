import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { FRIEND_SERVICE } from '@app/common';
import { FriendshipEntity } from '@app/entity';
import { FriendService } from './friend.service';

function toDto(f: FriendshipEntity) {
  return {
    id: f.id,
    userId: f.userId,
    targetUserId: f.targetUserId,
    createdAt: f.createdAt.getTime().toString(),
  };
}

@Controller()
export class FriendController {
  constructor(private readonly friend: FriendService) {}

  @GrpcMethod(FRIEND_SERVICE, 'AddFriend')
  async addFriend(data: { userId: string; targetUserId: string }) {
    return toDto(await this.friend.add(data.userId, data.targetUserId));
  }

  @GrpcMethod(FRIEND_SERVICE, 'ListFriends')
  async listFriends(data: { userId: string }) {
    const friends = await this.friend.list(data.userId);
    return { friends: friends.map(toDto) };
  }

  @GrpcMethod(FRIEND_SERVICE, 'AreFriends')
  async areFriends(data: { userId: string; targetUserIds: string[] }) {
    const result = await this.friend.check(data.userId, data.targetUserIds);
    return { result };
  }
}
