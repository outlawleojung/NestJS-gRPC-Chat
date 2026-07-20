import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/entity';
import { RepositoryModule } from '@app/repository';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [DatabaseModule, RepositoryModule],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AppModule {}
