import { TimestampEntities } from "src/generics/timestamp.entities";
import { ServicesEntity } from "src/services/entities/service.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity('reviews')
export class Review extends TimestampEntities {
    @Column({
        type: 'double',
    })
    rating: number;

    @Column("text")
    comment: string;

    @ManyToOne(
        () => ServicesEntity,
        (service) => service.reviews,
        {
            nullable: true,
            eager: true,
            cascade: false
        }
    )
    service: ServicesEntity

    @ManyToOne(
        () => UserEntity,
        (user) => user.givenReviews,
        {
            nullable: false,
            eager: true,
            cascade: false
        }
    )
    owner: UserEntity;

    @ManyToOne(
        () => UserEntity,
        (user) => user.receivedReviews,
        {
            nullable: false,
            eager: true,
            cascade: false
        }
    )
    target: UserEntity;
}
