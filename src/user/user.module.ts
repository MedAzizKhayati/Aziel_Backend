import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import * as dotenv from 'dotenv';
import { AtStrategy } from './strategy/at.strategy';
import { RtStrategy } from './strategy/rt.strategy';

dotenv.config();
@Module({
  imports:[TypeOrmModule.forFeature([UserEntity]),
  PassportModule.register({
    defaultStrategy: 'jwt'
  }),
  JwtModule.register({
      secret: process.env.SECRET,
      signOptions: {
        expiresIn: 3600
      }
    })
],
  controllers: [UserController],
  providers: [UserService, AtStrategy ,RtStrategy ]
})
export class UserModule {}
