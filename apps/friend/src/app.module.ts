import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/entity';
import { RepositoryModule } from '@app/repository';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';

@Module({
  imports: [DatabaseModule, RepositoryModule],
  controllers: [FriendController],
  providers: [FriendService],
})
export class AppModule {}
