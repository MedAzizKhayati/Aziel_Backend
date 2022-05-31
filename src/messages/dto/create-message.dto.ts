import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { CreateOrderDto } from "src/orders/dto/create-order.dto";

export class CreateMessageDto {
    @IsNotEmpty()
    @MaxLength(1000)
    message: string;

    @IsNotEmpty()
    @IsString()
    targetId: string;

    @IsNotEmpty()
    @IsString()
    ownerId: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => CreateOrderDto)
    customOrder: CreateOrderDto
}
