import { BaseRepository } from './base.repository';

class TestRepository extends BaseRepository<any> {
  // 상속이 정상 동작하는지 확인용
}

describe('BaseRepository', () => {
  let repo: TestRepository;
  let typeorm: any;

  beforeEach(() => {
    typeorm = {
      create: jest.fn((data) => ({ ...data, __created: true })),
      save: jest.fn(async (entity) => ({ ...entity, id: 'generated-id' })),
      findOne: jest.fn(),
    };
    repo = new TestRepository(typeorm);
  });

  describe('createAndSave', () => {
    it('creates then saves in order and returns the persisted entity', async () => {
      const result = await repo.createAndSave({ name: 'foo' });

      expect(typeorm.create).toHaveBeenCalledWith({ name: 'foo' });
      expect(typeorm.save).toHaveBeenCalledWith({ name: 'foo', __created: true });
      expect(result).toEqual({ name: 'foo', __created: true, id: 'generated-id' });
    });
  });

  describe('findById', () => {
    it('delegates to findOne with { where: { id } }', async () => {
      typeorm.findOne.mockResolvedValue({ id: 'x' });
      const result = await repo.findById('x');

      expect(typeorm.findOne).toHaveBeenCalledWith({ where: { id: 'x' } });
      expect(result).toEqual({ id: 'x' });
    });

    it('returns null when not found', async () => {
      typeorm.findOne.mockResolvedValue(null);
      expect(await repo.findById('missing')).toBeNull();
    });
  });
});
