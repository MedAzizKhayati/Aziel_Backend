import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TimestampEntities } from 'src/generics/timestamp.entities';
import { ServicesEntity } from "src/services/entities/service.entity";
import { capitalizeWords } from "src/generics/helpers";

@Entity('service_categories')
export class ServiceCategory extends TimestampEntities {
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

    @OneToMany(
        () => ServicesEntity,
        (service: ServicesEntity) => service.category,
        {
            nullable: true,
            cascade: true
        }
    )
    services: ServicesEntity[];

    @BeforeInsert()
    @BeforeUpdate()
    captilizeTitleAndDescription(){
        if(this.title)
            this.title = capitalizeWords(this.title);
        if(this.description)
            this.description = this.description[0].toUpperCase() + this.description.slice(1);
    }
}