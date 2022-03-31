import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayloadInterface } from '../interfaces/payload.interface';
@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    userRepository: any;
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get<string>('RT_SECRET'),
            ignoreExpiration: false,
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: PayloadInterface) {
        const refreshToken = req
            ?.get('authorization')
            ?.replace('Bearer', '')
            .trim();

        if (!refreshToken) throw new ForbiddenException('Refresh token malformed');
       /* const user = await this.userRepository.findOne({ email: payload.email });

        if (user) {
            delete user.salt;
            delete user.password;
            return {
                ...user,
                refreshToken,
            };
        } else {
            throw new UnauthorizedException();
        }*/
        return {
            ...payload,
            refreshToken,
          };
    }
}