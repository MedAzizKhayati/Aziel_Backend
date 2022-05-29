import { PartialType } from "@nestjs/mapped-types";
import { IsEmail, IsPhoneNumber, MaxLength, MinLength } from "class-validator";

class UserUpdateDtoFull {
    @IsEmail()
    email: string;

    @MinLength(7)
    @MaxLength(64)
    password: string;

    @MinLength(3)
    @MaxLength(32)
    firstName: string;

    @MinLength(3)
    @MaxLength(32)
    lastName: string;

    @IsPhoneNumber('TN')
    phonenumber: string;
}

export class UserUpdateDto extends PartialType(UserUpdateDtoFull) {}
