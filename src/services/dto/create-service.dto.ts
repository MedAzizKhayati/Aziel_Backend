import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ServiceCategory } from "src/service_categories/entities/service_category.entity";

export class CreateServiceDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsString()
    categoryId: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;
}
