import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  onModuleInit(): void {
    this.client = new Redis({
      host: process.env.REDIS_HOST ?? '127.0.0.1',
      port: Number(process.env.REDIS_PORT ?? 6379),
      lazyConnect: false,
      maxRetriesPerRequest: 3,
    });
    this.client.on('connect', () => this.logger.log('Connected to Redis'));
    this.client.on('error', (err) =>
      this.logger.error(`Redis error: ${err.message}`),
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.quit();
  }

  get raw(): Redis {
    return this.client;
  }

  // 룸 멤버 집합
  async addRoomMember(roomId: string, userId: string): Promise<void> {
    const { roomMembersKey } = await import('./redis.keys');
    await this.client.sadd(roomMembersKey(roomId), userId);
  }

  async getRoomMembers(roomId: string): Promise<string[]> {
    const { roomMembersKey } = await import('./redis.keys');
    return this.client.smembers(roomMembersKey(roomId));
  }
}
