import { Injectable } from '@nestjs/common';
import { FriendshipRepository } from '@app/repository';
import { FriendshipEntity } from '@app/entity';

@Injectable()
export class FriendService {
  constructor(private readonly friendships: FriendshipRepository) {}

  add(userId: string, targetUserId: string): Promise<FriendshipEntity> {
    return this.friendships.createAndSave({ userId, targetUserId });
  }

  list(userId: string): Promise<FriendshipEntity[]> {
    return this.friendships.findByUser(userId);
  }

  async check(userId: string, targetUserIds: string[]): Promise<boolean[]> {
    const rows = await this.friendships.findRelations(userId, targetUserIds);
    const set = new Set(rows.map((r) => r.targetUserId));
    return targetUserIds.map((id) => set.has(id));
  }
}
