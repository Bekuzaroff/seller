import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Chat } from './entities/chat.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserEntity } from 'src/auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Chat, UserEntity]), AuthModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
