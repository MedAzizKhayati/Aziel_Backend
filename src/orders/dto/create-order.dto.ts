import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, MinDate } from "class-validator";
import { ONE_DAY } from "src/generics/helpers";

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
    price: number;


    @IsDate()
    @MinDate(new Date(+new Date() + ONE_DAY), {
        message: 'Delivery date must be at least one day from now',
    })
    @IsOptional()
    deliveryDate: Date;

}
