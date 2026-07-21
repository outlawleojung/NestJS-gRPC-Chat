import { Test } from '@nestjs/testing';
import {
  ChatRoomMemberRepository,
  ChatRoomRepository,
  MessageRepository,
} from '@app/repository';
import { NatsService, chatRoomMessageSubject } from '@app/nats';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;
  let rooms: jest.Mocked<ChatRoomRepository>;
  let members: jest.Mocked<ChatRoomMemberRepository>;
  let messages: jest.Mocked<MessageRepository>;
  let nats: jest.Mocked<NatsService>;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: ChatRoomRepository,
          useValue: { createAndSave: jest.fn(), incrementSeq: jest.fn() },
        },
        {
          provide: ChatRoomMemberRepository,
          useValue: { createAndSave: jest.fn() },
        },
        {
          provide: MessageRepository,
          useValue: { createAndSave: jest.fn(), listByRoom: jest.fn() },
        },
        {
          provide: NatsService,
          useValue: { publish: jest.fn() },
        },
      ],
    }).compile();

    service = mod.get(ChatService);
    rooms = mod.get(ChatRoomRepository);
    members = mod.get(ChatRoomMemberRepository);
    messages = mod.get(MessageRepository);
    nats = mod.get(NatsService);
  });

  describe('createRoom', () => {
    it('creates a room and one member per participant', async () => {
      const room = { id: 'room-1' } as any;
      rooms.createAndSave.mockResolvedValue(room);
      members.createAndSave.mockResolvedValue({} as any);

      const result = await service.createRoom(['u1', 'u2', 'u3']);

      expect(result).toBe(room);
      expect(rooms.createAndSave).toHaveBeenCalledTimes(1);
      expect(members.createAndSave).toHaveBeenCalledTimes(3);
      expect(members.createAndSave).toHaveBeenNthCalledWith(1, { roomId: 'room-1', userId: 'u1' });
      expect(members.createAndSave).toHaveBeenNthCalledWith(2, { roomId: 'room-1', userId: 'u2' });
      expect(members.createAndSave).toHaveBeenNthCalledWith(3, { roomId: 'room-1', userId: 'u3' });
    });
  });

  describe('saveAndPublish', () => {
    it('assigns seqId from incrementSeq, persists, and publishes NATS event', async () => {
      rooms.incrementSeq.mockResolvedValue(7);
      const saved = {
        id: 'msg-1',
        roomId: 'room-1',
        senderId: 'u1',
        seqId: 7,
        content: 'hi',
        createdAt: new Date('2026-01-01T00:00:00Z'),
      } as any;
      messages.createAndSave.mockResolvedValue(saved);

      const result = await service.saveAndPublish('room-1', 'u1', 'hi');

      expect(result).toBe(saved);
      expect(rooms.incrementSeq).toHaveBeenCalledWith('room-1');
      expect(messages.createAndSave).toHaveBeenCalledWith({
        roomId: 'room-1',
        senderId: 'u1',
        seqId: 7,
        content: 'hi',
      });
      expect(nats.publish).toHaveBeenCalledWith(chatRoomMessageSubject('room-1'), {
        id: 'msg-1',
        roomId: 'room-1',
        senderId: 'u1',
        content: 'hi',
        seqId: 7,
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('does not publish if incrementSeq throws', async () => {
      rooms.incrementSeq.mockRejectedValue(new Error('not found'));
      await expect(service.saveAndPublish('room-x', 'u1', 'hi')).rejects.toThrow('not found');
      expect(messages.createAndSave).not.toHaveBeenCalled();
      expect(nats.publish).not.toHaveBeenCalled();
    });
  });

  describe('listMessages', () => {
    it('clamps limit into [1, 100] range', async () => {
      messages.listByRoom.mockResolvedValue({ items: [], nextCursor: '' });

      await service.listMessages('room-1', undefined, 5000);
      expect(messages.listByRoom).toHaveBeenLastCalledWith('room-1', undefined, 100);

      await service.listMessages('room-1', undefined, 0);
      expect(messages.listByRoom).toHaveBeenLastCalledWith('room-1', undefined, 1);

      await service.listMessages('room-1', 'cursor-x', 30);
      expect(messages.listByRoom).toHaveBeenLastCalledWith('room-1', 'cursor-x', 30);
    });
  });
});
