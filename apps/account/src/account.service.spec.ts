import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserRepository } from '@app/repository';
import { AccountService } from './account.service';

describe('AccountService', () => {
  let service: AccountService;
  let repo: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: UserRepository,
          useValue: { findById: jest.fn(), createAndSave: jest.fn() },
        },
      ],
    }).compile();
    service = mod.get(AccountService);
    repo = mod.get(UserRepository);
  });

  describe('get', () => {
    it('returns the user when found', async () => {
      const user = { id: 'u-1', email: 'a@ex.com', nickname: 'a' } as any;
      repo.findById.mockResolvedValue(user);
      expect(await service.get('u-1')).toBe(user);
      expect(repo.findById).toHaveBeenCalledWith('u-1');
    });

    it('throws NotFoundException with the id in the message when missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.get('missing')).rejects.toBeInstanceOf(NotFoundException);
      await expect(service.get('missing')).rejects.toThrow(/missing/);
    });
  });

  describe('create', () => {
    it('delegates to repo.createAndSave with email and nickname', async () => {
      const persisted = { id: 'u-2', email: 'b@ex.com', nickname: 'b' } as any;
      repo.createAndSave.mockResolvedValue(persisted);

      const result = await service.create('b@ex.com', 'b');

      expect(result).toBe(persisted);
      expect(repo.createAndSave).toHaveBeenCalledWith({ email: 'b@ex.com', nickname: 'b' });
    });
  });
});
