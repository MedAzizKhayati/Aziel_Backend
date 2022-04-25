import { TimestampEntities } from "src/generics/timestamp.entities";
import { UserEntity } from "src/user/entities/user.entity";
import { BeforeInsert, Column, Entity, ManyToOne } from "typeorm";

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

    @BeforeInsert()
    async setChatId() {
        const firstId = this.owner.id > this.target.id ? this.target.id : this.owner.id;
        const secondId = this.owner.id > this.target.id ? this.owner.id : this.target.id;
        this.chatId = `${firstId}-${secondId}`;
    }
}
