import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TimestampEntities } from 'src/generics/timestamp.entities';
import { UserEntity } from "src/user/entities/user.entity";
import { ServiceCategory } from "src/service_categories/entities/service_category.entity";
import { Review } from "src/reviews/entities/review.entity";
import { OrdersEntity } from "src/orders/entities/order.entity";

@Entity('services')
export class ServicesEntity extends TimestampEntities {
    @Column({
        length: 50
    })
    title: string;

    @Column({
        length: 300
    })
    description: string;

    @Column()
    imagePath: string;

    @Column({
        default: 0,
        type: 'double'
    })
    rating: number;

    @Column({
        default: 0,
        type: 'double'
    })
    price: number;

    @Column({
        default: 0
    })
    reviewsCount: number;

    @Column({
        default: true
    })
    isActive: boolean;

    @ManyToOne(
        () => ServiceCategory,
        serviceCategory => serviceCategory.services,
        {
            cascade: ['insert', 'update'],
            nullable: true,
            eager: true,
        }
    )
    category: ServiceCategory;

    @ManyToOne(
        () => UserEntity,
        (user) => user.services,
        {
            nullable: false,
            eager: true
        }
    )
    user: UserEntity;

    @OneToMany(
        () => Review,
        (review) => review.service,
        {
            cascade: ['insert', 'update'],
            nullable: true,
            eager: false
        }
    )
    reviews: Review[];

    @OneToMany(
        type => OrdersEntity,
        order => order.service,
        {
          nullable: true,
          cascade: true
        }
      )
      orders: OrdersEntity[];
    
}