import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ACCOUNT_SERVICE } from '@app/common';
import { UserEntity } from '@app/entity';
import { AccountService } from './account.service';

function toDto(user: UserEntity) {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    createdAt: user.createdAt.toISOString(),
  };
}

@Controller()
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @GrpcMethod(ACCOUNT_SERVICE, 'GetAccount')
  async getAccount(data: { id: string }) {
    return toDto(await this.account.get(data.id));
  }

  @GrpcMethod(ACCOUNT_SERVICE, 'CreateAccount')
  async createAccount(data: { email: string; nickname: string }) {
    return toDto(await this.account.create(data.email, data.nickname));
  }
}
