import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TimestampEntities } from 'src/Generics/timestamp.entities';
import { serviceEnum } from "src/enums/service_category.enum";
import { UserEntity } from "src/user/entities/user.entity";

@Entity('services')
export class ServicesEntity extends TimestampEntities {

    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({
        name: 'name',
        length: 50
    })
    title: string;

    @Column({
        length: 300
    })
    description: string;

    @Column()
    path: string;

    @Column({
        type: 'enum',
        enum: serviceEnum,
        //default: serviceEnum.,
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