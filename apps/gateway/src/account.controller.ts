import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AccountGrpcClient } from '@app/grpc';
import { ACCOUNT_GRPC_SERVICE } from './grpc.tokens';

@Controller('accounts')
export class AccountController {
  constructor(
    @Inject(ACCOUNT_GRPC_SERVICE) private readonly account: AccountGrpcClient,
  ) {}

  @Get(':id')
  get(@Param('id') id: string) {
    return firstValueFrom(this.account.GetAccount({ id }));
  }

  @Post()
  create(@Body() body: { email: string; nickname: string }) {
    return firstValueFrom(this.account.CreateAccount(body));
  }
}
