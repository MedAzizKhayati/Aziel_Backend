import {
  ForbiddenException,
  Injectable,
  NotFoundException,
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
import { sendEmail } from 'src/utils/sendEmail';
import { round } from 'src/generics/helpers';
import { Review } from 'src/reviews/entities/review.entity';
import axios from 'axios';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) { }

  async register(userData: UserSubscribeDto) {
    const user = this.userRepository.create(userData);
    await this.userRepository.save(user);
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    await sendEmail(user.email, user.firstName);
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
        expiresIn: '5m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: '15d',
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
      return {
        user: user,
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
      };
    }
    else
      throw new NotFoundException('Incorrect email or password');
  }

  async refreshTokens(user: UserEntity & { refreshToken: string }) {
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

  async logOut(user: UserEntity) {
    if (user) {
      await this.userRepository.update(
        {
          id: user.id,
        },
        {
          hashedRt: null,
        },
      );
      return { "success": "You've successfully logged out." };
    }
    throw new UnauthorizedException();
  }

  async updateProfileImage(id: string, file: Express.Multer.File) {
    if (!file) throw new NotFoundException('No file found!');
    const imagePath = file.path.replace('public', '').split('\\').join('/');
    const status = await this.userRepository.update(id, { profileImage: imagePath });
    if (!status.affected) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return status;
  }

  updateOne(id: string, user: UserEntity): any {
    delete user.email;
    delete user.password;
    return this.userRepository.update(id, user);
  }

  findOne(id: string): any {
    return this.userRepository.findOne(id);
  }

  incrementReviewsAsAseller(user: UserEntity, review: Review) {
    user.ratingAsSeller = round((user.ratingAsSeller * user.reviewsCountAsSeller++ + review.rating) / user.reviewsCountAsSeller);
    return this.userRepository.save(user);
  }

  decrementReviewsAsAseller(user: UserEntity, review: Review) {
    if (user.reviewsCountAsSeller > 1)
      user.ratingAsSeller = round((user.ratingAsSeller * user.reviewsCountAsSeller-- - review.rating) / user.reviewsCountAsSeller);
    else {
      user.ratingAsSeller = 0;
      user.reviewsCountAsSeller = 0;
    }
    return this.userRepository.save(user);
  }

  decrementReviewsAsAbuyer(user: UserEntity, review: Review) {
    if (user.reviewsCountAsBuyer > 1)
      user.ratingAsBuyer = round((user.ratingAsBuyer * user.reviewsCountAsBuyer-- - review.rating) / user.reviewsCountAsBuyer);
    else {
      user.ratingAsBuyer = 0;
      user.reviewsCountAsBuyer = 0;
    }
    return this.userRepository.save(user);
  }

  incrementReviewsAsAbuyer(user: UserEntity, review: Review) {
    user.ratingAsBuyer = round((user.ratingAsBuyer * user.reviewsCountAsBuyer++ + review.rating) / user.reviewsCountAsBuyer);
    return this.userRepository.save(user);
  }

  async updateBalance(userId: string, amount: number) {
    const user = await this.userRepository.findOne(userId);
    if (!user) throw new NotFoundException('User not found');
    user.balance += amount;
    if (user.balance < 0)
      throw new Error("You don't have sufficient balance!");
    return this.userRepository.save(user);
  }

  async registerNotificationToken(userId: string, token: string) {
    if (token && userId)
      return this.userRepository.update(userId, { notificationToken: token });
    throw new NotFoundException('User not found');
  }

  async testNotification(user: UserEntity) {
    axios.post(
      'https://exp.host/--/api/v2/push/send',
      {
        to: user.notificationToken,
        title: 'Aziel Notification',
        body: 'This is an Aziel Notificaiton.',
        data: {
          message: 'Test a message',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return "Notification Sent";
  }

  async sendNotification(user: UserEntity | string, title: string, message: string, data: object) {
    if (typeof user === 'string') {
      const userId = user;
      const userData = await this.userRepository.findOne(userId);
      if (!userData) throw new NotFoundException('User not found');
      user = userData;
    }
    axios.post(
      'https://exp.host/--/api/v2/push/send',
      {
        to: user.notificationToken,
        title: title,
        body: message,
        data,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return "Notification Sent";
  }

}
