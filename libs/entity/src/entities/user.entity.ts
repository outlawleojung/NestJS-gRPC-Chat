import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ length: 320 })
  email!: string;

  @Column({ length: 60 })
  nickname!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
