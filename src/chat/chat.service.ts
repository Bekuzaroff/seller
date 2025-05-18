import { Injectable } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatService {

  constructor(
    @InjectRepository(Message)
    private readonly repository: Repository<Message>,

    @InjectRepository(Chat)
    private readonly chat_repository: Repository<Chat>
  ){}
  async create(message: MessageDto) {
  // Сортируем ID, чтобы не было дублей чатов (1-2 и 2-1)
  const [user1_id, user2_id] = [message.sender_id, message.receiver_id].sort((a, b) => a - b);

  // Проверяем, существует ли чат между этими двумя
  let chat = await this.chat_repository.findOne({
    where: { user1_id, user2_id },
  });

  // Если нет — создаём
  if (!chat) {
    chat = this.chat_repository.create({ user1_id, user2_id });
    await this.chat_repository.save(chat);
  }

  // Создаём сообщение
  const msg = this.repository.create({
    message: message.message,
    sender_id: message.sender_id,
    receiver_id: message.receiver_id,
    chat,
  });

  await this.repository.save(msg);
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
