import { MinLength, IsNotEmpty } from 'class-validator';

export class CreateServiceCategoryDto {

    @IsNotEmpty()
    @MinLength(3)
    title: string;

    @MinLength(10)
    description: string;

}
