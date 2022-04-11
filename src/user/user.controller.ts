import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Ip,
  Post,
  Query,
  Req,
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
import GoogleTokenDto from './dto/google-token.dto';

@Controller('user')
@UseInterceptors(new (CastToUserDTO))
export class UserController {
  constructor(private userService: UserService) { }
  /*@Post('/google/login')
  async googleLogin(
    @Body() body: GoogleTokenDto,
    @Req() req,
    @Ip() ip: string,
  ) {
    const result = await this.userService.loginGoogleUser(body.token, {
      userAgent: req.headers['user-agent'],
      ipAddress: ip,
    });
    if (result) {
      return result;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'Error while logging in with google',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }*/ 
  @Get()
  getOneByEmail(@Query('email') email: string): Promise<any> {
    return this.userService.getOneByEmail(email);
  }

  @Post()
  register(@Body() userData:  UserSubscribeDto): Promise<any> {
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
  async user(@Req() req: any) {
    return { user: req.user };
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
