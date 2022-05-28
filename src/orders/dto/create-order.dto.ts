import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateOrderDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsString()
    serviceId: string;

    @IsNumber()
    @IsNotEmpty()
    total: number;
}
