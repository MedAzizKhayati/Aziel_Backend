import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { SetOrderStatusDto } from './dto/set-order-status.dto';

@WebSocketGateway({ namespace: 'chat' })
@Injectable()
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private messagesService: MessagesService,
  ) { }

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

  @SubscribeMessage('setOrderStatus')
  setOrderStatus(
    @MessageBody() setOrderStatusDto: SetOrderStatusDto,
  ) {
    this.messagesService.setOrderStatus(setOrderStatusDto, this.server);
  }
}
