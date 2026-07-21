import { Test } from '@nestjs/testing';
import { NatsService } from '@app/nats';
import { RedisService } from '@app/redis';
import { RealtimeGateway } from './realtime.gateway';
import { CHAT_GRPC_SERVICE } from './grpc.tokens';

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;
  let redis: jest.Mocked<RedisService>;
  let nats: jest.Mocked<NatsService>;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        {
          provide: NatsService,
          useValue: { publish: jest.fn(), subscribe: jest.fn() },
        },
        {
          provide: RedisService,
          useValue: { addRoomMember: jest.fn() },
        },
        {
          provide: CHAT_GRPC_SERVICE,
          useValue: { SaveMessage: jest.fn() },
        },
      ],
    }).compile();
    gateway = mod.get(RealtimeGateway);
    redis = mod.get(RedisService);
    nats = mod.get(NatsService);
  });

  it('subscribes to the chat room wildcard on onModuleInit', () => {
    gateway.onModuleInit();
    expect(nats.subscribe).toHaveBeenCalledWith('chat.room.*.message', expect.any(Function));
  });

  describe('onJoin', () => {
    it('assigns userId to socket.data, joins the room, and adds the member to Redis', async () => {
      const socket = { data: {}, join: jest.fn() } as any;

      const result = await gateway.onJoin(socket, { userId: 'u-1', roomId: 'r-1' });

      expect(socket.data.userId).toBe('u-1');
      expect(socket.join).toHaveBeenCalledWith('room:r-1');
      expect(redis.addRoomMember).toHaveBeenCalledWith('r-1', 'u-1');
      expect(result).toEqual({ ok: true });
    });
  });
});
