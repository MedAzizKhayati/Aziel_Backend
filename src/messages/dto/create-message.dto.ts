import { IsNotEmpty, IsString, MaxLength } from "class-validator";

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
}
