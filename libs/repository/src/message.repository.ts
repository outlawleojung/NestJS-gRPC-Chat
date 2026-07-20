import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { MessageEntity } from '@app/entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class MessageRepository extends BaseRepository<MessageEntity> {
  constructor(
    @InjectRepository(MessageEntity) repo: Repository<MessageEntity>,
  ) {
    super(repo);
  }

  /**
   * 커서 페이지네이션. cursor 는 이전 페이지 마지막 message.id
   */
  async listByRoom(
    roomId: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<{ items: MessageEntity[]; nextCursor: string }> {
    const where: Record<string, unknown> = { roomId };
    if (cursor) {
      const prev = await this.repo.findOne({ where: { id: cursor } });
      if (prev) where.seqId = LessThan(prev.seqId);
    }
    const items = await this.repo.find({
      where,
      order: { seqId: 'DESC' },
      take: limit,
    });
    return { items, nextCursor: items.at(-1)?.id ?? '' };
  }
}
