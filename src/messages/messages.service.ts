import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNumber } from 'class-validator';
import { UserEntity } from 'src/user/entities/user.entity';
import { In, Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { Server } from 'socket.io';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) { }

  async create(createMessageDto: CreateMessageDto, server: Server) {
    const owner = await this.userRepository.findOne(createMessageDto.ownerId);
    if (!owner)
      throw new Error('Owner not found');
    const target = await this.userRepository.findOne(createMessageDto.targetId);
    if (!target)
      throw new Error('Target not found');
    let message = this.messagesRepository.create(createMessageDto);
    message.owner = owner;
    message.target = target;

    message = await this.messagesRepository.save(message);
    server.emit(message.chatId, this.getMessageDTO(message));
  }

  findWithOptions(options: any, take: number = 10, page: number = 1) {
    if (!take || !isNumber(take) || take < 0)
      take = 10;
    if (!page || !isNumber(page) || page < 1)
      page = 1;

    return this.messagesRepository.find({
      take,
      skip: (page - 1) * take,
      ...options,
    });
  }

  async findAll(id: string, take: number = 10, page: number = 1) {
    const messages = await this.findWithOptions({
      where: {
        chatId: id,
      },
      relations: ['owner', 'target'],
      order: {
        createdAt: 'DESC',
      }
    }, take, page);
    return messages.map(this.getMessageDTO);
  }

  getMessageDTO(message: Message) {
    return {
      message: message.message,
      ownerId: message.owner.id,
      targetId: message.target.id,
      createdAt: message.createdAt,
      id: message.id,
      chatId: message.chatId,
      seen: message.seen,
    }
  }

  async markMessagesAsSeen(messageIds: string[], user: UserEntity) {
    const u = await this.messagesRepository.update({
      id: In(messageIds),
      target: user,
    }, {
      seen: true,
    });
    return u;
  }

  async getUnreadMessagesCount(userId: string) {
    const res = await this.messagesRepository.createQueryBuilder("message")
      .select('COUNT(DISTINCT chatId)', 'count')
      .where(`
          targetId = :userId 
          AND seen = false 
          AND createdAt = (
            select MAX(createdAt) 
            from messages as m 
            where m.chatId = message.chatId
          )`,
        { userId }
      )
      .getRawOne();
    return res;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
