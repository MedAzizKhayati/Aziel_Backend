import { OneToMany, Column, Entity, BeforeInsert, BeforeUpdate, AfterLoad } from 'typeorm';
import { Exclude } from 'class-transformer';
import { TimestampEntities } from 'src/generics/timestamp.entities';
import { UserRoleEnum } from 'src/user/enums/user-role.enum';
import { ServicesEntity } from 'src/services/entities/service.entity';
import { capitalizeWords } from 'src/generics/helpers';
import { Review } from 'src/reviews/entities/review.entity';
import { OrdersEntity } from 'src/orders/entities/order.entity';
import * as bcrypt from 'bcrypt';

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

  @Column({
    default: 100,
    type: 'double',
  })
  balance: number;

  @Column({
    default: 0,
    type: 'double',
  })
  ratingAsSeller: number;

  @Column({
    default: 0,
    type: 'double',
  })
  ratingAsBuyer: number;

  @Column({ nullable: true })
  hashedRt: string;

  @Column({
    nullable: false,
    default: "",
  })
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
    type => OrdersEntity,
    order => order.buyer,
    {
      nullable: true,
      cascade: true
    }
  )
  orders: OrdersEntity[];

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

  @Column({
    default: '',
  })
  notificationToken: string;


  @BeforeUpdate()
  @BeforeInsert()
  async capitalizeName() {
    this.firstName = capitalizeWords(this.firstName);
    this.lastName = capitalizeWords(this.lastName);
  }

  private tempPassword: string;

  @AfterLoad()
  private loadTempPassword(): void {
    this.tempPassword = this.password;
  }

  @BeforeUpdate()
  @BeforeInsert()
  async hashPassword() {
    if (this.tempPassword !== this.password) {
      console.log('Hashing password');     
      this.salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, this.salt);
    }
  }
}
