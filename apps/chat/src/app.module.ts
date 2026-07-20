import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/entity';
import { RepositoryModule } from '@app/repository';
import { NatsModule } from '@app/nats';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [DatabaseModule, RepositoryModule, NatsModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class AppModule {}
