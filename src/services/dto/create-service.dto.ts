import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
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
    @Min(0)
    @IsNotEmpty()
    price: number;
}
