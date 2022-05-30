import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/user/guards/roles.guard';
import { User } from 'src/user/decorators/user.param-decorater';
import { UserEntity } from 'src/user/entities/user.entity';
import { OrdersEntity } from './entities/order.entity';
import { Roles } from 'src/user/decorators/roles.metadata';
import { UserRoleEnum } from 'src/user/enums/user-role.enum';

@Controller('orders')
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto,
  @User() user: UserEntity,

  ): Promise<OrdersEntity> {
    return this.ordersService.create(createOrderDto,user);
  }

  @Post('recover/:id')
  @Roles(UserRoleEnum.ADMIN)
  async restoreOrder(
    @Param('id') id: string,
  ) {
    return await this.ordersService.restoreOrder(id);
  }

  @Get('user/:id')
  findByBuyer(
    @Param('id') id: string,
  ): Promise<OrdersEntity[]> {
    return this.ordersService.findByBuyer(id);
  }

  @Get('all/?:limit/?:page')
  findAll(
    @Param('limit') limit: number,
    @Param('page') page: number,
  ): Promise<OrdersEntity[]> {
    console.log("all orders");
    return this.ordersService.findAll(+limit, +page);
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) :Promise<OrdersEntity>{
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @Roles(UserRoleEnum.ADMIN)
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  @Delete('soft/:id')
  async deleteService(
    @Param('id') id: string,
  ) {
    return this.ordersService.softDeleteOrder(id);
  }

}

