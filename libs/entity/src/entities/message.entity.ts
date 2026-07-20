import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatRoomEntity } from './chat-room.entity';

@Entity('messages')
@Index(['roomId', 'seqId'])
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  roomId!: string;

  @Column({ type: 'uuid' })
  senderId!: string;

  @Column()
  seqId!: number;

  @Column({ type: 'text' })
  content!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => ChatRoomEntity, (r) => r.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room!: ChatRoomEntity;
}
