import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoomMemberEntity } from '@app/entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class ChatRoomMemberRepository extends BaseRepository<ChatRoomMemberEntity> {
  constructor(
    @InjectRepository(ChatRoomMemberEntity)
    repo: Repository<ChatRoomMemberEntity>,
  ) {
    super(repo);
  }

  findByRoom(roomId: string): Promise<ChatRoomMemberEntity[]> {
    return this.repo.find({ where: { roomId } });
  }
}
