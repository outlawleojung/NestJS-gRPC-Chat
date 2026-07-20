import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { FriendGrpcClient } from '@app/grpc';
import { FRIEND_GRPC_SERVICE } from './grpc.tokens';

@Controller('users/:userId/friends')
export class FriendController {
  constructor(
    @Inject(FRIEND_GRPC_SERVICE) private readonly friend: FriendGrpcClient,
  ) {}

  @Get()
  list(@Param('userId') userId: string) {
    return firstValueFrom(this.friend.ListFriends({ userId }));
  }

  @Post()
  add(@Param('userId') userId: string, @Body() body: { targetUserId: string }) {
    return firstValueFrom(
      this.friend.AddFriend({ userId, targetUserId: body.targetUserId }),
    );
  }
}
