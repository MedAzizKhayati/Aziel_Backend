import { IsNotEmpty, IsString, Min } from "class-validator";

export class OrderDeliveryDto {
    @IsNotEmpty()
    @IsString()
    deliveryDescription: string;
}