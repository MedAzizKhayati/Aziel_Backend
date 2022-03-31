import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { PayloadInterface } from '../interfaces/payload.interface';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('AT_SECRET'),
    });
  }

  async validate(payload: PayloadInterface) {
    const user = await this.userRepository.findOne({ email: payload.email });
    if (user) {
      delete user.salt;
      delete user.password;
      delete user.hashedRt;
      return user;
    } else throw new UnauthorizedException();
  }
}
