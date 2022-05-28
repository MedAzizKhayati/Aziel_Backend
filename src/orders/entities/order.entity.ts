import { Column, Entity, ManyToOne } from "typeorm";
import { TimestampEntities } from 'src/generics/timestamp.entities';
import { UserEntity } from "src/user/entities/user.entity";
import { ServicesEntity } from "src/services/entities/service.entity";
import { OrderStatus } from "../enums/order-status.enum";

@Entity('orders')
export class OrdersEntity extends TimestampEntities {

    @Column({
        type: 'double'
    })
    total: number;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.InProgress,
    })
    status: String;

    @Column({
     })
     description: String;

    @ManyToOne(
        () => UserEntity,
        (user) => user.orders,
        {
            nullable: false,
            eager: true
        }
    )
    buyer: UserEntity;

    @ManyToOne(
        () => ServicesEntity,
        service => service.orders,
        {
            cascade: ['insert', 'update'],
            nullable: true,
            eager: true,
        }
    )
    service: ServicesEntity;

}