import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersEntity } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdersEntity]),
    
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]

})
export class OrdersModule {}
