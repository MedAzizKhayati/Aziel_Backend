import { Injectable, NotFoundException } from '@nestjs/common';
import { UserSubscribeDto } from './dto/user-subscribe.dto';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginCredentialsDto } from './dto/login-credentials.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
  }
  async register(userData: UserSubscribeDto): Promise<Partial<UserEntity>> {
    const user = this.userRepository.create({
      ...userData
    });
    user.salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, user.salt);

    await this.userRepository.save(user);

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    };

  }

  async login(credentials: LoginCredentialsDto) {
    const { email, password } = credentials;
    
    const user = await this.userRepository.findOne({ email });

    if (!user)
      throw new NotFoundException('There is no account registered with this e-mail.');

    const hashedPassword = await bcrypt.hash(password, user.salt);
    if (hashedPassword === user.password)
      return {
        email: user.email,
        role: user.role
      }
    else
      throw new NotFoundException('Incorrect email or password');
  }

  async getOneByEmail(email: string) {
    const user = await this.userRepository.findOne({ email });
    if(!user)
      throw new NotFoundException('There is no account registered with this e-mail.');
    return {
      email: user.email,
      role: user.role
    }
  }
}