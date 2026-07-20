import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  connect,
  JSONCodec,
  NatsConnection,
  Subscription,
} from 'nats';

/**
 * NATS 클라이언트 래퍼.
 *  - 각 Pod마다 하나씩 붙어서 Pub/Sub으로 이벤트를 주고받음
 *  - Realtime-Hub가 여러 Pod로 스케일 아웃될 때 Pod 간 이벤트 전파 채널로 사용
 */
@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NatsService.name);
  private connection!: NatsConnection;
  private readonly codec = JSONCodec<unknown>();
  private readonly subscriptions: Subscription[] = [];

  async onModuleInit(): Promise<void> {
    const url = process.env.NATS_URL ?? 'nats://127.0.0.1:4222';
    this.connection = await connect({ servers: url });
    this.logger.log(`Connected to NATS at ${url}`);
  }

  async onModuleDestroy(): Promise<void> {
    for (const s of this.subscriptions) s.unsubscribe();
    await this.connection?.drain();
  }

  publish<T>(subject: string, payload: T): void {
    this.connection.publish(subject, this.codec.encode(payload));
  }

  /**
   * subject 패턴을 구독하고, 메시지 수신 시 handler 호출.
   *  - subject 예: "chat.room.*.message"
   */
  subscribe<T>(
    subject: string,
    handler: (payload: T, subject: string) => void | Promise<void>,
  ): void {
    const sub = this.connection.subscribe(subject);
    this.subscriptions.push(sub);

    (async () => {
      for await (const msg of sub) {
        try {
          const decoded = this.codec.decode(msg.data) as T;
          await handler(decoded, msg.subject);
        } catch (err) {
          this.logger.error(
            `handler for ${msg.subject} failed: ${(err as Error).message}`,
          );
        }
      }
    })();
  }
}
