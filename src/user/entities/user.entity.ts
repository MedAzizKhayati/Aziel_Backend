import { OneToMany, Column, Entity, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Exclude } from 'class-transformer';
import { TimestampEntities } from 'src/generics/timestamp.entities';
import { UserRoleEnum } from 'src/user/enums/user-role.enum';
import { ServicesEntity } from 'src/services/entities/service.entity';
import { capitalizeWords } from 'src/generics/helpers';
import { Review } from 'src/reviews/entities/review.entity';

@Entity('user')
export class UserEntity extends TimestampEntities {
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
    nullable: false
  })
  firstName: string;

  @Column({
    length: 50,
    nullable: false,
  })
  lastName: string;

  @Column({
    length: 50,
  })
  phoneNumber: string;

  @Column({ nullable: true })
  hashedRt: string;

  @Column({ nullable: true })
  profileImage: string;

  @OneToMany(
    type => ServicesEntity,
    service => service.user,
    {
      nullable: true,
      cascade: true
    }
  )
  services: ServicesEntity[];

  @OneToMany(
    () => Review,
    (review) => review.owner,
    {
      cascade: ['insert', 'update'],
      nullable: true,
      eager: false
    }
  )
  givenReviews: Review[];

  @OneToMany(
    () => Review,
    (review) => review.target,
    {
      cascade: ['insert', 'update'],
      nullable: true,
      eager: false
    }
  )
  receivedReviews: Review[];

  @Column({
    default: 0,
  })
  reviewsCountAsBuyer: number;
  
  @Column({
    default: 0,
  })
  reviewsCountAsSeller: number;

  @BeforeUpdate()
  @BeforeInsert()
  async capitalizeName() {
    this.firstName = capitalizeWords(this.firstName);
    this.lastName = capitalizeWords(this.lastName);
  }
}
