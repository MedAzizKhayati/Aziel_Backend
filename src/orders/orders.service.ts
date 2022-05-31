import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNumber } from 'class-validator';
import { ServicesService } from 'src/services/services.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserRoleEnum } from 'src/user/enums/user-role.enum';
import { UserService } from 'src/user/user.service';
import { LessThan, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDeliveryDto } from './dto/order-delivery.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersEntity } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrdersEntity)
    private ordersRepository: Repository<OrdersEntity>,
    private servicesService: ServicesService,
    private userService: UserService
  ) { }

  async create(createOrderDto: CreateOrderDto, buyer: UserEntity, status = OrderStatus.IN_PROGRESS): Promise<OrdersEntity> {
    const newOrder = this.ordersRepository.create({ ...createOrderDto, buyer });
    const service = await this.servicesService.findOne(createOrderDto.serviceId);
    if (!service)
      throw new NotFoundException('Service does not exist');
    newOrder.service = service;
    newOrder.total = newOrder.price * 1.05;
    newOrder.status = status;
    return await this.ordersRepository.save(newOrder);
  }

  async findAll(take: number = 10, page: number = 1): Promise<OrdersEntity[]> {
    return this.findByCondition({}, take, page);
  }

  async findOne(id: string): Promise<OrdersEntity> {
    const order = await this.ordersRepository.findOne(id);
    if (!order) {
      throw new NotFoundException(`order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const newOrder = await this.ordersRepository.preload({
      id,
      ...updateOrderDto
    });
    if (!newOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return newOrder;
  }

  async remove(id: string) {
    return await this.ordersRepository.delete(id);
  }

  async findByCondition(condition: any, take: number = 10, page: number = 1, orderBy = {}, conditions = {}): Promise<OrdersEntity[]> {
    if (!take || !isNumber(take) || take < 0)
      take = 10;
    if (!page || !isNumber(page) || page < 1)
      page = 1;
    return await this.ordersRepository.find({
      where: condition,
      take,
      skip: (page - 1) * take,
      order: orderBy,
      ...conditions
    });
  }


  findByBuyer(buyerId: string, take: number = 10, page: number = 1): Promise<OrdersEntity[]> {
    return this.findByCondition({ buyer: { id: buyerId } }, take, page, { createdAt: 'DESC' });
  }

  findBySeller(sellerId: string, take: number = 10, page: number = 1): Promise<OrdersEntity[]> {
    return this.findByCondition(
      { service: { user: { id: sellerId } } },
      take,
      page,
      { createdAt: 'DESC' },
      { relations: ['service', 'service.user'] }
    );
  }
  async findByBuyerBefore(orderId: string, buyerId: string, take: number = 10, page: number = 1): Promise<OrdersEntity[]> {
    if (!orderId)
      return this.findByBuyer(buyerId, take, page);

    const order = await this.ordersRepository.findOne(orderId);
    return this.findByCondition(
      {
        buyer: { id: buyerId },
        createdAt: LessThan(order.createdAt)
      },
      take,
      page,
      { createdAt: 'DESC' }
    );
  }

  async deliverOrder(id: string, delivery: OrderDeliveryDto, user: UserEntity) {
    let order = await this.ordersRepository.findOne(id);
    if (!order)
      throw new NotFoundException('Order does not exist');
    if (
      order.service.user.id !== user.id ||
      order.status !== OrderStatus.IN_PROGRESS
    )
      throw new NotFoundException('You are not allowed to deliver this order.');
    order.status = OrderStatus.COMPLETED;
    order.deliveredAt = new Date();
    order.deliveryDescription = delivery.deliveryDescription;
    
    order = await this.ordersRepository.save(order);
    this.userService.sendNotification(order.buyer, 'Delivery Ready', `Order ${order.id} has been delivered.`, {});
    return order;
  }

  async findBySellerBefore(orderId: string, sellerId: string, take: number = 10, page: number = 1): Promise<OrdersEntity[]> {
    if (!orderId)
      return this.findBySeller(sellerId, take, page);

    const order = await this.ordersRepository.findOne(orderId);
    return this.findByCondition(
      {
        service: { user: { id: sellerId } },
        createdAt: LessThan(order.createdAt)
      },
      take,
      page,
      { createdAt: 'DESC' },
      { relations: ['service', 'service.user'] }
    );
  }

  async softDeleteOrder(id: string) {
    const order = await this.ordersRepository.findOne(id);
    if (!order) {
      throw new NotFoundException('');
    }
    return this.ordersRepository.softDelete(id);
  }

  async changeOrderStatus(id: string, status: OrderStatus) {
    const order = await this.ordersRepository.findOne(id);
    if (!order)
      throw new NotFoundException('Order does not exist');

    order.status = status;
    return this.ordersRepository.save(order);
  }

  async acceptOrder(id: string) {
    let order = await this.ordersRepository.findOne(id);
    if (!order)
      throw new NotFoundException('Order does not exist');

    let buyer = order.buyer;
    let service = order.service;
    await this.userService.updateBalance(buyer.id, -order.total);
    await this.userService.updateBalance(service.user.id, order.price * 0.95);

    delete order.buyer;
    delete order.service;

    order.status = OrderStatus.IN_PROGRESS;
    order = await this.ordersRepository.save(order);

    return { ...order, buyer, service };
  }

  async restoreOrder(id: string) {
    const order = await this.ordersRepository.findOne({
      where: {
        id
      },
      withDeleted: true
    });
    if (!order) {
      throw new NotFoundException('Order does not exist');
    }
    return this.ordersRepository.restore(id);
  }
}


