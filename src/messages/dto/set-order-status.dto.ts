import { Type } from "class-transformer";
import { IsEnum, isEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { CreateOrderDto } from "src/orders/dto/create-order.dto";
import { OrderStatus } from "src/orders/enums/order-status.enum";

export class SetOrderStatusDto {
    @IsNotEmpty()
    @IsEnum(OrderStatus)
    status: OrderStatus;
    
    @IsOptional()
    @IsString()
    orderId: string;

    @IsOptional()
    @IsString()
    chatId: string;
}
