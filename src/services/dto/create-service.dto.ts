import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateServiceDto {
    @IsNotEmpty()
    @IsString()
    title: string;
  
    @IsNotEmpty()
    @IsString()
    description: string;
  
    @IsOptional()
    @IsString()
    path: string;

    @IsNotEmpty()
    @IsString()
    category: string;
  
}
