import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PayloadInterface } from '../interfaces/payload.interface';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
    userRepository: any;
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('AT_SECRET'),
        });
    }

    async validate(payload: PayloadInterface) {
       /* const user = await this.userRepository.findOne({ email: payload.email });

        if (user) {
            delete user.salt;
            delete user.password;
            return user;
        } else {
            throw new UnauthorizedException();
        }*/
        return payload;
    }
}
