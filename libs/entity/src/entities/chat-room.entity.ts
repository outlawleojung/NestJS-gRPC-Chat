import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatRoomMemberEntity } from './chat-room-member.entity';
import { MessageEntity } from './message.entity';

@Entity('chat_rooms')
export class ChatRoomEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: 0 })
  lastSeqId!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => ChatRoomMemberEntity, (m) => m.room)
  members!: ChatRoomMemberEntity[];

  @OneToMany(() => MessageEntity, (m) => m.room)
  messages!: MessageEntity[];
}
