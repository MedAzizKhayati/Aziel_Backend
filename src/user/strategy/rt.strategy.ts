import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayloadInterface } from '../interfaces/payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('RT_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: PayloadInterface) {
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');
    const user = await this.userRepository.findOne({ email: payload.email });

    if (user && user.hashedRt) {
      delete user.salt;
      delete user.password;
      return {
        ...user,
        refreshToken,
      };
    } else {
      throw new ForbiddenException();
    }
  }
}
