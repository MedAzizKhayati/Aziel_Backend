import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginCredentialsDto {

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}