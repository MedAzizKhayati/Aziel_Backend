import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { UserSubscribeDto } from './dto/user-subscribe.dto';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as argon from 'argon2';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { PayloadInterface } from './interfaces/payload.interface';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { sendEmail } from 'src/utils/sendEmail';
import { from, switchMap } from 'rxjs';
import { round } from 'src/generics/helpers';
import { Review } from 'src/reviews/entities/review.entity';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private config: ConfigService,
    //private oauthClient: Auth.OAuth2Client,
    @Inject(REQUEST) private request,
  ) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    //this.oauthClient = new google.auth.OAuth2(clientId, clientSecret);
  }
  /* async loginGoogleUser(
     token: string,
     values: { userAgent: string; ipAddress: string },
   ) {
     const tokenInfo = await this.oauthClient.getTokenInfo(token);
     const email = tokenInfo.email;
     const user = await this.userRepository.findOne({
       where: {
         email
       },
     });
     return this.getTokens(user.id, email);
   }
 */
  async register(userData: UserSubscribeDto) {
    const user = this.userRepository.create(userData);
    user.salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, user.salt);

    await this.userRepository.save(user);
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    await sendEmail(user.email, user.firstName);
    delete user.salt;
    delete user.password;
    delete user.hashedRt;
    return {
      user: user,
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
    };
  }

  async getTokens(userId: string, email: string) {
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

  async updateRtHash(id: string, rt: string) {
    const hash = await argon.hash(rt);
    const user = { hashedRt: hash };
    return this.userRepository.update(id, user);
  }

  async login(credentials: LoginCredentialsDto) {
    const { email, password } = credentials;

    const user = await this.userRepository.findOne({ email });

    if (!user)
      throw new NotFoundException(
        'There is no account registered with this e-mail.',
      );

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
        access_token: tokens.access_token,
      };
    } else throw new NotFoundException('Incorrect email or password');
  }

  async refreshTokens() {
    // Getting user from request, thanks to the guard.
    const user = this.request.user;

    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await argon.verify(user.hashedRt, user.refreshToken);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async getOneByEmail(email: string) {
    const user = await this.userRepository.findOne({ email });
    if (!user)
      throw new NotFoundException(
        'There is no account registered with this e-mail.',
      );
    return {
      email: user.email,
      role: user.role,
    };
  }

  async findAll(options = null): Promise<UserEntity[]> {
    if (options) {
      return await this.userRepository.find(options);
    }
    return await this.userRepository.find();
  }

  async logOut() {
    if (this?.request?.user) {
      await this.userRepository.update(
        {
          id: this.request.user.id,
        },
        {
          hashedRt: null,
        },
      );
      return { "success": "You've successfully logged out." };
    }
    throw new UnauthorizedException();
  }

  updateOne(id: string, user) {
    delete user.email;
    delete user.password;
    delete user.role;
    return from(this.userRepository.update(id, user)).pipe(
      switchMap(() => this.findOne(id))
    );
  }
  findOne(id: string): any {
    return this.userRepository.findOne(id);
  }

  incrementReviewsAsAseller(user: UserEntity, review: Review) {
    user.ratingAsSeller = round((user.ratingAsSeller * user.reviewsCountAsSeller++ + review.rating) / user.reviewsCountAsSeller);
    return this.userRepository.save(user);
  }
  
  decrementReviewsAsAseller(id: string) {
    const query = this.userRepository.createQueryBuilder()
      .update(UserEntity)
      .set({
        reviewsCountAsSeller: () => "reviewsCountAsSeller - 1"
      })
      .where("id = :id", { id: id })
      .andWhere("reviewsCountAsSeller > 0")
    return query.execute();
  }

  decrementReviewsAsAbuyer(id: string) {
    const query = this.userRepository.createQueryBuilder()
      .update(UserEntity)
      .set({
        reviewsCountAsBuyer: () => "reviewsCountAsBuyer - 1"
      })
      .where("id = :id", { id: id })
      .andWhere("reviewsCountAsBuyer > 0")
    return query.execute();
  }

  incrementReviewsAsAbuyer(user: UserEntity, review: Review) {
    user.ratingAsBuyer = round((user.ratingAsBuyer * user.reviewsCountAsBuyer++ + review.rating) / user.reviewsCountAsBuyer);
    return this.userRepository.save(user);
  }
}
