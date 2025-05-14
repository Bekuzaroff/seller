import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("products")
export class Product {
    @PrimaryGeneratedColumn()
    product_id: number

    @Column({
        type: 'varchar',
        length: 30,
    })
    name: string

    @Column({
        type: 'varchar',
        length: 1000,
    })
    description: string

    @Column({
        type: 'number'
    })
    price: number

    @Column({
        type: 'array',
        length: 10,
    })
    images: string[]

    @Column({
        type: 'boolean',
        nullable: true
    })
    is_new: boolean

    @Column({
        type: 'number'
    })
    user_id: number
    

    
    
}
