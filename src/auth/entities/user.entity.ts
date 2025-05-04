import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity("users")
export class UserEntity{
    @PrimaryGeneratedColumn()
    user_id: number

    @Column({
        type: 'varchar',
        length: 100,
        unique: true
    })
    user_name: string

    @Column({
        type: 'varchar',
        length: 100,
        unique: true
    })
    email: string

    @Column({
        type: 'varchar',
        length: 100
    })
    password: string

    @Column({
        type: 'varchar',
        length: 300,
        nullable: true
    })
    refresh_token: string | null
}