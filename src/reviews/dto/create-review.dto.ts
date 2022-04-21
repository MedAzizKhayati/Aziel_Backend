import { IsNotEmpty, IsNumber, IsString, Max, Min, MinLength } from "class-validator";

export class CreateReviewDto {
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(5)
    rating: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    comment: string;

    @IsString()
    serviceId: string;

    @IsString()
    @IsNotEmpty()
    targetId: string;

}
