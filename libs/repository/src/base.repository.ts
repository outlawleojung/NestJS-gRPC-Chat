import { DeepPartial, Repository, ObjectLiteral } from 'typeorm';

/**
 * TypeORM Repository를 얇게 감싼 BaseRepository.
 *  - 각 도메인 Repository가 상속해서 공통 유틸(예: createAndSave)을 재사용
 */
export abstract class BaseRepository<T extends ObjectLiteral> {
  constructor(protected readonly repo: Repository<T>) {}

  createAndSave(data: DeepPartial<T>): Promise<T> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  findById(id: string): Promise<T | null> {
    return this.repo.findOne({ where: { id } as any });
  }
}
