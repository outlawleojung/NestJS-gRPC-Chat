import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoomEntity } from '@app/entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class ChatRoomRepository extends BaseRepository<ChatRoomEntity> {
  constructor(
    @InjectRepository(ChatRoomEntity) repo: Repository<ChatRoomEntity>,
  ) {
    super(repo);
  }

  /**
   * 원자적으로 lastSeqId 를 1 증가시키고 새 값을 리턴.
   *  - 메시지 저장 시 seq_id 채번용
   */
  async incrementSeq(roomId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .update()
      .set({ lastSeqId: () => '"lastSeqId" + 1' })
      .where('id = :id', { id: roomId })
      .returning(['lastSeqId'])
      .execute();

    const raw = result.raw?.[0];
    if (!raw) throw new Error(`ChatRoom ${roomId} not found`);
    return Number(raw.lastSeqId);
  }
}
