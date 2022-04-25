import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Inject, Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({ namespace: 'chat' })
@Injectable()
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private messagesService: MessagesService,
  ) {}

  @SubscribeMessage('send')
  create(@MessageBody() createMessageDto: CreateMessageDto) {
    this.messagesService.create(createMessageDto, this.server);
  }

  @SubscribeMessage('findOneMessage')
  findOne(@MessageBody() id: number) {
    return this.messagesService.findOne(id);
  }

  @SubscribeMessage('removeMessage')
  remove(@MessageBody() id: number) {
    return this.messagesService.remove(id);
  }
}
