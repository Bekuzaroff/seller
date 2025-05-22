import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
  ) {}

  async create(messageDto: MessageDto) {
    const [user1_id, user2_id] = [messageDto.sender_id, messageDto.receiver_id].sort((a, b) => a - b);

    // Ищем чат
    let chat = await this.chatRepo.findOne({
      where: { user1_id, user2_id },
    });

    // Создаём чат, если нет
    if (!chat) {
      chat = this.chatRepo.create({ user1_id, user2_id });
      await this.chatRepo.save(chat);
    }

    // Сохраняем сообщение
    const message = this.messageRepo.create({
      ...messageDto,
      chat,
    });

    return await this.messageRepo.save(message);
  }

  async findMessagesByChatId(chatId: number) {
    return this.messageRepo.find({
      where: { chat: { chat_id: chatId } },
      order: { sent_at: 'ASC' },
      relations: ['chat'],
    });
  }

  async findAllChatsForUser(userId: number) {
    return this.chatRepo.find({
      where: [
        { user1_id: userId },
        { user2_id: userId },
      ],
    });
  }

  async findOne(id: number) {
    return await this.chatRepo.findOne({ where: { chat_id: id } });
  }

  async remove(id: number) {
    return await this.chatRepo.delete(id);
  }
}