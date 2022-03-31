import { ForbiddenException, Inject, Injectable, NotFoundException, Req, Res, Scope, UnauthorizedException } from '@nestjs/common';
import { UserSubscribeDto } from './dto/user-subscribe.dto';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as argon from 'argon2';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { REQUEST } from '@nestjs/core';
import { PayloadInterface } from './interfaces/payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable({
  scope: Scope.REQUEST,
})
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private config: ConfigService,
    @Inject(REQUEST) private request: any,
  ) {
  }
  async register(userData: UserSubscribeDto) {
    const user = this.userRepository.create({
      ...userData
    });
    user.salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, user.salt);

    await this.userRepository.save(user);
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    delete user.salt;
    delete user.password;
    delete user.hashedRt;
    return {
      user: user,
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token
    };
  }

  async getTokens(userId: number, email: string) {
    const jwtPayload: PayloadInterface = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async updateRtHash(id: number, rt: string) {
    const hash = await argon.hash(rt);
    const user = { hashedRt: hash };
    return this.userRepository.update(id, user);
  }


  async login(credentials: LoginCredentialsDto) {
    const { email, password } = credentials;

    const user = await this.userRepository.findOne({ email });

    if (!user)
      throw new NotFoundException('There is no account registered with this e-mail.');

    const hashedPassword = await bcrypt.hash(password, user.salt);
    if (hashedPassword === user.password) {
      const tokens = await this.getTokens(user.id, user.email);
      await this.updateRtHash(user.id, tokens.refresh_token);
      delete user.salt;
      delete user.password;
      delete user.hashedRt;
      return {
        user: user,
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token
      };
    }
    else
      throw new NotFoundException('Incorrect email or password');
  }
  async refreshTokens(email: string, rt: string) {
    const user = await this.userRepository.findOne({ email });
    console.log(user);
    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await argon.verify(user.hashedRt, rt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }
  async getOneByEmail(email: string) {
    const user = await this.userRepository.findOne({ email });
    if (!user)
      throw new NotFoundException('There is no account registered with this e-mail.');
    return {
      email: user.email,
      role: user.role
    }
  }
  async findAll(options = null): Promise<UserEntity[]> {
    if (options) {
      return await this.userRepository.find(options);
    }
    return await this.userRepository.find();
  }
  /* async getUser() {
     try {
       const cookie = this.request.cookies['access_token'];
       const data = this.jwtService.verify(cookie);
       if (!data) {
         throw new UnauthorizedException();
       }
       const user = await this.userRepository.findOne({ id: data['id'] });
 
       const { password, salt, ...result } = user;
 
       return result;
     } catch (e) {
       throw new UnauthorizedException();
     }
   }*/
  async logOut(id: number) {
    return this.userRepository.update({ id, hashedRt: "NOT NULL" }, { hashedRt: "NULL" });
  }
}