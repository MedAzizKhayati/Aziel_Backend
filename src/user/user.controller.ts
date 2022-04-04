import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Request,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserSubscribeDto } from './dto/user-subscribe.dto';
import { UserService } from './user.service';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserEntity } from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { CastToUserDTO } from './interceptors/user.interceptor';

@Controller('user')
@UseInterceptors(new (CastToUserDTO))
export class UserController {
  constructor(private userService: UserService) { }

  @Get()
  getOneByEmail(@Query('email') email: string): Promise<any> {
    return this.userService.getOneByEmail(email);
  }

  @Post()
  register(@Body() userData: UserSubscribeDto): Promise<any> {
    return this.userService.register(userData);
  }

  @Post('login')
  async login(@Body() credentials: LoginCredentialsDto) {
    return await this.userService.login(credentials);
  }

  @UseGuards(AuthGuard())
  @Get('all')
  findAll(@Req() req: any): Promise<UserEntity[]> {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard())
  @Get('me')
  async user(@Req() req: any){
    return {user: req.user};
  }

  @UseGuards(AuthGuard())
  @Post('logout')
  logout() {
    return this.userService.logOut();
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshTokens() {
    return this.userService.refreshTokens();
  }
}
