import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TimestampEntities } from 'src/Generics/timestamp.entities';
import { ServiceEnum } from "src/enums/service_category.enum";
import { UserEntity } from "src/user/entities/user.entity";

@Entity('services')
export class ServicesEntity extends TimestampEntities {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        length: 50
    })
    title: string;

    @Column({
        length: 300
    })
    description: string;

    @Column()
    path: string;

    @Column()
    status: string;

    @Column({
        type: 'enum',
        enum: ServiceEnum,
        default: ServiceEnum.OTHER,
    })
    category: string;

    @ManyToOne(
        type => UserEntity,
        (user) => user.services,
        {
            cascade: ['insert', 'update'],
            nullable: true,
            eager: true
        }
    )
    user: UserEntity;
}