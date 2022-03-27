import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { UserSubscribeDto } from './dto/user-subscribe.dto';
import { UserService } from './user.service';
import { LoginCredentialsDto } from './dto/login-credentials.dto';


@Controller('user')
export class UserController {
  constructor(
    private userService: UserService
  ) { }

  @Get()
  getOneByEmail(
    @Query('email') email: string,
  ): Promise<object> {
    return this.userService.getOneByEmail(email);
  }

  @Post()
  register(
    @Body() userData: UserSubscribeDto
  ): Promise<object> {
    return this.userService.register(userData);
  }

  @Post('login')
  login(
    @Body() credentials: LoginCredentialsDto
  ): Promise<object> {
    return this.userService.login(credentials);
  }


}
