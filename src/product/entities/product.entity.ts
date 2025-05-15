import { UserEntity } from "src/auth/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("products")
export class Product {
    @PrimaryGeneratedColumn()
    product_id: number

    @Column({
        type: 'varchar',
        length: 30
    })
    name: string

    @Column({
        type: 'varchar',
        length: 1000,
    })
    description: string

    @Column({
        type: 'int'
    })
    price: number

    @Column({
        type: 'varchar',
        length: 10,
        array: true
    })
    images: string[]

    @Column({
        type: 'boolean',
        nullable: true
    })
    is_new: boolean

    @ManyToOne(() => UserEntity, (user) => user.products)
    @JoinColumn({name: 'user_id'})
    user: UserEntity
}
