import { ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { UserSubscribeDto } from './dto/user-subscribe.dto';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { UserRoleEnum } from '../enums/user-role.enum';
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
    try {
      await this.userRepository.save(user);
    } catch (e) {
    }
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      };

  }

  async login(credentials: LoginCredentialsDto)  {

     const {email, password} = credentials;
    
    // Vérifier est ce qu'il y a un user avec ce login ou ce mdp
    const user = await this.userRepository.createQueryBuilder("user")
      .where(" user.email = :email",
        {email}
        )
      .getOne();
    console.log(user);

    if (!user)
      throw new NotFoundException('incorrect email or password  ');
    // Si oui je vérifie est ce que le mot est correct ou pas
    const hashedPassword = await bcrypt.hash(password, user.salt);
    if (hashedPassword === user.password) {
      const payload = {
        email: user.email,
        role: user.role
      };
    } else {
      // Si mot de passe incorrect je déclenche une erreur
      throw new NotFoundException('incorrect email or password  ');
    }
  }
}