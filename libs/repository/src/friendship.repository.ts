import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FriendshipEntity } from '@app/entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class FriendshipRepository extends BaseRepository<FriendshipEntity> {
  constructor(
    @InjectRepository(FriendshipEntity) repo: Repository<FriendshipEntity>,
  ) {
    super(repo);
  }

  findByUser(userId: string): Promise<FriendshipEntity[]> {
    return this.repo.find({ where: { userId } });
  }

  findRelations(
    userId: string,
    targetUserIds: string[],
  ): Promise<FriendshipEntity[]> {
    return this.repo.find({
      where: { userId, targetUserId: In(targetUserIds) },
    });
  }
}
