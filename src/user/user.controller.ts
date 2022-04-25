import {
  Body,
  Controller,
  Get,
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
import GoogleTokenDto from './dto/google-token.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { map, Observable, of, tap } from 'rxjs';
import path, { join } from 'path';
import { diskStorage } from 'multer';
import { RolesGuard } from './guards/roles.guard';

export const storage = {
  storage: diskStorage({
      destination: './uploads/profileimages',
      filename: (req, file, cb) => {
          const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
          const extension: string = path.parse(file.originalname).ext;

          cb(null, `${filename}${extension}`)
      }
  })

}

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
  logout() {
    return this.userService.logOut();
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshTokens() {
    return this.userService.refreshTokens();
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(@UploadedFile() file, @Req() req): Observable<Object> {
      const user = req.user;
      return this.userService.updateOne(user.id, {profileImage: file.filename}).pipe(
          tap((user: UserEntity) => console.log(user)),
          map((user:UserEntity) => ({profileImage: user.profileImage}))
      )
  }
  @Get('profile-image/:imagename')
    findProfileImage(@Param('imagename') imagename, @Res() res): Observable<Object> {
        return of(res.sendFile(join(process.cwd(), 'uploads/profileimages/' + imagename)));
    }
}
function uuidv4() {
  throw new Error('Function not implemented.');
}

