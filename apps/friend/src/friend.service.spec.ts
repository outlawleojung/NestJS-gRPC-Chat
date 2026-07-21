import { Test } from '@nestjs/testing';
import { FriendshipRepository } from '@app/repository';
import { FriendService } from './friend.service';

describe('FriendService', () => {
  let service: FriendService;
  let repo: jest.Mocked<FriendshipRepository>;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        FriendService,
        {
          provide: FriendshipRepository,
          useValue: {
            createAndSave: jest.fn(),
            findByUser: jest.fn(),
            findRelations: jest.fn(),
          },
        },
      ],
    }).compile();
    service = mod.get(FriendService);
    repo = mod.get(FriendshipRepository);
  });

  describe('add', () => {
    it('persists a friendship with the given user pair', async () => {
      const persisted = { id: 'f-1', userId: 'u1', targetUserId: 'u2' } as any;
      repo.createAndSave.mockResolvedValue(persisted);

      const result = await service.add('u1', 'u2');

      expect(result).toBe(persisted);
      expect(repo.createAndSave).toHaveBeenCalledWith({ userId: 'u1', targetUserId: 'u2' });
    });
  });

  describe('list', () => {
    it('returns friendships for the given user', async () => {
      const rows = [{ id: 'f-1' }, { id: 'f-2' }] as any;
      repo.findByUser.mockResolvedValue(rows);
      expect(await service.list('u1')).toBe(rows);
      expect(repo.findByUser).toHaveBeenCalledWith('u1');
    });
  });

  describe('check', () => {
    it('returns a boolean per targetUserId preserving order', async () => {
      // u1 is friends with u2 and u4, but not u3
      repo.findRelations.mockResolvedValue([
        { userId: 'u1', targetUserId: 'u2' },
        { userId: 'u1', targetUserId: 'u4' },
      ] as any);

      const result = await service.check('u1', ['u2', 'u3', 'u4']);

      expect(result).toEqual([true, false, true]);
      expect(repo.findRelations).toHaveBeenCalledWith('u1', ['u2', 'u3', 'u4']);
    });

    it('returns all false when no relations exist', async () => {
      repo.findRelations.mockResolvedValue([]);
      const result = await service.check('u1', ['u2', 'u3']);
      expect(result).toEqual([false, false]);
    });

    it('handles empty targetUserIds', async () => {
      repo.findRelations.mockResolvedValue([]);
      const result = await service.check('u1', []);
      expect(result).toEqual([]);
    });
  });
});
