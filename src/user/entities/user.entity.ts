import { OneToMany, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { TimestampEntities } from 'src/Generics/timestamp.entities';
import { UserRoleEnum } from 'src/enums/user-role.enum';
import { ServicesEntity } from 'src/services/entities/service.entity';

@Entity('user')
export class UserEntity extends TimestampEntities {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  @Exclude()
  salt: string;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    default: UserRoleEnum.USER,
  })
  role: string;

  @Column({
    length: 50,
  })
  firstName: string;

  @Column({
    length: 50,
  })
  lastName: string;

  @Column({
    length: 50,
  })
  phoneNumber: string;

  @Column({ nullable: true })
  hashedRt: string;
  services: any;

  @Column({nullable: true})
    profileImage: string;
    
  @OneToMany(
    type => ServicesEntity,
    (service) => service.user,
    {
      nullable: true,
      cascade: true
    }
  )
  service: ServicesEntity[];
}
