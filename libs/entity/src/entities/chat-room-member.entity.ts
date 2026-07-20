import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { ChatRoomEntity } from './chat-room.entity';

@Entity('chat_room_members')
@Index(['roomId', 'userId'], { unique: true })
export class ChatRoomMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  roomId!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ default: 0 })
  lastReadSeqId!: number;

  @ManyToOne(() => ChatRoomEntity, (r) => r.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room!: ChatRoomEntity;
}
