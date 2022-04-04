import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class UserSubscribeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(7)
  @MaxLength(64)
  @IsNotEmpty()
  password: string;

  @MinLength(3)
  @MaxLength(32)
  @IsNotEmpty()
  firstName: string;

  @MinLength(3)
  @MaxLength(32)
  @IsNotEmpty()
  lastName: string;
}
