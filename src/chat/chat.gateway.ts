import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { MessageDto } from './dto/message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() chatId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`chat_${chatId}`);
    console.log(`Client ${client.id} joined room chat_${chatId}`);
  }

  @SubscribeMessage('writeToChat')
  async handleMessage(
    @MessageBody() message: MessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const savedMessage = await this.chatService.create(message);

    // Используем chat.id из сохранённого сообщения
    const roomName = `chat_${savedMessage.chat.chat_id}`;

    // Шлём только участникам чата
    this.server.to(roomName).emit('newMessage', savedMessage);
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(@MessageBody() chatId: number) {
    return await this.chatService.findMessagesByChatId(chatId);
  }

  @SubscribeMessage('getChats')
  async handleGetChats(@MessageBody() userId: number) {
    return await this.chatService.findAllChatsForUser(userId);
  }
}