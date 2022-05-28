import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNumber } from 'class-validator';
import { ServicesEntity } from 'src/services/entities/service.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserRoleEnum } from 'src/user/enums/user-role.enum';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersEntity } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrdersEntity)
    private OrdersRepository: Repository<OrdersEntity>,
  ) { }

  async create(createOrderDto: CreateOrderDto, buyer: UserEntity): Promise<OrdersEntity> {
    const newOrder = this.OrdersRepository.create({ ...createOrderDto, buyer });
    return await this.OrdersRepository.save(newOrder);
  }
  
  async findAll(take: number = 10, page: number = 1): Promise<OrdersEntity[]> {
    return this.findByCondition({}, take, page);
  }

  async findOne(id: string): Promise<OrdersEntity> {
    const order = await this.OrdersRepository.findOne(id);
    if (!order) {
      throw new NotFoundException(`order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const newOrder = await this.OrdersRepository.preload({
      id,
      ...updateOrderDto
    });
    if (!newOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return newOrder;
  }

  async remove(id: string) {
    return await this.OrdersRepository.delete(id);
  }

  async findByCondition(condition: any, take: number = 10, page: number = 1): Promise<OrdersEntity[]> {
    if (!take || !isNumber(take) || take < 0)
      take = 10;
    if (!page || !isNumber(page) || page < 1)
      page = 1;
    return await this.OrdersRepository.find({
      where: condition,
      take,
      skip: (page - 1) * take,
    });
  }


  findByBuyer(buyerId: string, take: number = 10, page: number = 1): Promise<OrdersEntity[]> {
    return this.findByCondition({ buyer: { id: buyerId }, take: take, page: page});
  }


  async softDeleteOrder(id: string) {
    const order = await this.OrdersRepository.findOne({
      where: {
        id
      },
    });
    if (!order) {
      throw new NotFoundException('');
    }
    return this.OrdersRepository.softDelete(id);
  }


  async restoreOrder(id: string) {
    const order = await this.OrdersRepository.findOne({
      where: {
        id
      },
      withDeleted: true
    });
    if (!order) {
      throw new NotFoundException('Order does not exist');
    }
    return this.OrdersRepository.restore(id);
  }
}


