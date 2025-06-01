import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("categories")
export class Category {
    @PrimaryGeneratedColumn()
    category_id: number

    @Column({
        type: "varchar",
        length: 20
    })
    name: string
}
