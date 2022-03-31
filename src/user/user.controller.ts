import { Body, Controller, Get, Post, Query, Req, Request, Res, UseGuards } from '@nestjs/common';
import { UserSubscribeDto } from './dto/user-subscribe.dto';
import { UserService } from './user.service';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserEntity } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
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
  async login(
    @Body() credentials: LoginCredentialsDto
  ) {
    return await this.userService.login(credentials);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  findAll(@Request() req): Promise<UserEntity[]> {
    console.log(req.user);
    return this.userService.findAll();
  }

  /* @UseGuards(JwtAuthGuard)
   @Get('user')
   async user() {
     return this.userService.getUser();
   }
 */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    const user = req.user;
    console.log(user);
    return this.userService.logOut(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshTokens(@Request() req,
    @Body() hashedRt: string
  ) {
    const email = JSON.stringify(req.user.email);
    return this.userService.refreshTokens(email, hashedRt);
  }
}
