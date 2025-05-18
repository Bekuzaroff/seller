import { Column, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./message.entity";

@Entity()
export class Chat {
    @PrimaryGeneratedColumn()
    chat_id: number

    @OneToMany(() => Message, (msg) => msg.chat)
    @JoinTable({name: "messages"})
    messages: string[]

    @Column({
            type: 'int',
        })
    own_user_id: number
    
    @Column({
            type: 'int',
        })
    other_user_id: number
}
