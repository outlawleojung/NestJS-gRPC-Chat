import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '@app/repository';
import { UserEntity } from '@app/entity';

@Injectable()
export class AccountService {
  constructor(private readonly users: UserRepository) {}

  async get(id: string): Promise<UserEntity> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException(`user ${id} not found`);
    return user;
  }

  create(email: string, nickname: string): Promise<UserEntity> {
    return this.users.createAndSave({ email, nickname });
  }
}
