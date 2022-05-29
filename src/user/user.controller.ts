import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
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
import { FileInterceptor } from '@nestjs/platform-express';
import {  Observable, of } from 'rxjs';
import path, { join } from 'path';
import { diskStorage } from 'multer';
import { RolesGuard } from './guards/roles.guard';
import { User } from './decorators/user.param-decorater';
import { editFileName, imageFileFilter } from 'src/generics/helpers';

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

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  user(@Req() req: any) {
    return { user: req.user };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('all')
  findAll(@Req() req: any): Promise<UserEntity[]> {
    return this.userService.findAll();
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string): Promise<any> {
    return this.userService.findOne(id);
  }


  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  logout(
    @User() user,
  ) {
    return this.userService.logOut(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshTokens(
    @User() user,
  ) {
    return this.userService.refreshTokens(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/uploads/users',
      filename: editFileName,
    }),
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 16_000_000, // 16MB
    }
  }))
  updateProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @User() user,
  ) {
    return this.userService.updateProfileImage(user.id, file);
  }
}

