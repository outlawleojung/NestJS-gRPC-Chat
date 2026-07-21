import { Test } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

describe('ChatController', () => {
  let controller: ChatController;
  let service: jest.Mocked<ChatService>;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: {
            createRoom: jest.fn(),
            listMessages: jest.fn(),
            saveAndPublish: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = mod.get(ChatController);
    service = mod.get(ChatService);
  });

  describe('createRoom', () => {
    it('returns participantIds from the request even when entity has no members loaded', async () => {
      service.createRoom.mockResolvedValue({
        id: 'r-1',
        createdAt: new Date('2026-01-01T00:00:00Z'),
      } as any);

      const res = await controller.createRoom({ participantIds: ['u1', 'u2'] });

      expect(res).toEqual({
        id: 'r-1',
        participantIds: ['u1', 'u2'],
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });

  describe('listMessages', () => {
    it('defaults limit to 30 when not provided', async () => {
      service.listMessages.mockResolvedValue({ items: [], nextCursor: '' });
      await controller.listMessages({ roomId: 'r-1' });
      expect(service.listMessages).toHaveBeenCalledWith('r-1', undefined, 30);
    });

    it('passes cursor and limit through and maps items to DTOs', async () => {
      service.listMessages.mockResolvedValue({
        items: [
          {
            id: 'm-1',
            roomId: 'r-1',
            senderId: 'u1',
            content: 'hi',
            createdAt: new Date('2026-01-02T00:00:00Z'),
          } as any,
        ],
        nextCursor: 'm-1',
      });

      const res = await controller.listMessages({ roomId: 'r-1', cursor: 'c-1', limit: 10 });

      expect(service.listMessages).toHaveBeenCalledWith('r-1', 'c-1', 10);
      expect(res).toEqual({
        messages: [
          {
            id: 'm-1',
            roomId: 'r-1',
            senderId: 'u1',
            content: 'hi',
            createdAt: '2026-01-02T00:00:00.000Z',
          },
        ],
        nextCursor: 'm-1',
      });
    });
  });

  describe('saveMessage', () => {
    it('delegates to service and returns DTO shape', async () => {
      service.saveAndPublish.mockResolvedValue({
        id: 'm-9',
        roomId: 'r-1',
        senderId: 'u1',
        content: 'hi',
        createdAt: new Date('2026-01-03T00:00:00Z'),
      } as any);

      const res = await controller.saveMessage({ roomId: 'r-1', senderId: 'u1', content: 'hi' });

      expect(service.saveAndPublish).toHaveBeenCalledWith('r-1', 'u1', 'hi');
      expect(res).toEqual({
        id: 'm-9',
        roomId: 'r-1',
        senderId: 'u1',
        content: 'hi',
        createdAt: '2026-01-03T00:00:00.000Z',
      });
    });
  });
});
