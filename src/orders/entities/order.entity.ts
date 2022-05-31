import { Column, Entity, ManyToOne } from "typeorm";
import { TimestampEntities } from 'src/generics/timestamp.entities';
import { UserEntity } from "src/user/entities/user.entity";
import { ServicesEntity } from "src/services/entities/service.entity";
import { OrderStatus } from "../enums/order-status.enum";
import { getTomorrowsDateSQL } from "src/generics/helpers";

@Entity('orders')
export class OrdersEntity extends TimestampEntities {
    @Column({
        type: 'double'
    })
    total: number;

    @Column({
        type: 'double'
    })
    price: number;

    @Column()
    title: string;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.IN_PROGRESS,
    })
    status: String;

    @Column({
        type: 'text',
    })
    description: String;

    @Column({
        type: 'text',
    })
    deliveryDescription: String;

    @Column({
        default: '',
    })
    deliveryFile: String;

    @Column({
        type: 'timestamp',
        default: getTomorrowsDateSQL(),
    })
    deliveryDate: Date;

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