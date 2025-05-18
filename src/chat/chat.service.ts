import { Injectable } from '@nestjs/common';
import { ChatDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  create(createChatDto: ChatDto) {
    return 'This action adds a new chat';
  }

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
