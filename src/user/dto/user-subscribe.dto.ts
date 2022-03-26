import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserSubscribeDto {


  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  phonenumber: string;
}