import { TimestampEntities } from "src/generics/timestamp.entities";
import { OrdersEntity } from "src/orders/entities/order.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";

@Entity('messages')
export class Message extends TimestampEntities {
    @Column("text")
    message: string;

    @Column()
    chatId: string;

    @Column({
        default: false,
    })
    seen: boolean;

    @ManyToOne(
        () => UserEntity,
        (user) => user.givenReviews,
        {
            nullable: false,
            eager: false
        }
    )
    owner: UserEntity;

    @ManyToOne(
        () => UserEntity,
        (user) => user.receivedReviews,
        {
            nullable: false,
            eager: false
        }
    )
    target: UserEntity;

    @Column({
        default: '',
    })
    attachedFile: string;

    @OneToOne(
        () => OrdersEntity,
        {
            eager: true,
            cascade: true,
        }
    )
    @JoinColumn()
    customOrder: OrdersEntity;

    @BeforeInsert()
    async setChatId() {
        const firstId = this.owner.id > this.target.id ? this.target.id : this.owner.id;
        const secondId = this.owner.id > this.target.id ? this.owner.id : this.target.id;
        this.chatId = `${firstId}-${secondId}`;
    }
}
