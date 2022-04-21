import { round } from "src/generics/helpers";
import { TimestampEntities } from "src/generics/timestamp.entities";
import { ServicesEntity } from "src/services/entities/service.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { BeforeInsert, BeforeRecover, Column, Entity, ManyToOne } from "typeorm";

@Entity('reviews')
export class Review extends TimestampEntities {
    @Column({
        type: 'double',
    })
    rating: number;

    @Column()
    comment: string;

    @ManyToOne(
        () => ServicesEntity,
        (service) => service.reviews,
        {
            nullable: true,
            eager: true
        }
    )
    service: ServicesEntity

    @ManyToOne(
        () => UserEntity,
        (user) => user.givenReviews,
        {
            nullable: false,
            eager: true
        }
    )
    owner: UserEntity;

    @ManyToOne(
        () => UserEntity,
        (user) => user.receivedReviews,
        {
            nullable: false,
            eager: true
        }
    )
    target: UserEntity;
}
