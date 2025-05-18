import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Chat } from "./chat.entity";

@Entity({name: "messages"})
export class Message{
    @PrimaryGeneratedColumn()
    message_id: number

    @Column({
        type: 'varchar',
        length: 1000,
        nullable: true
    })
    message: string

    @Column({
        type: 'int',
    })
    sender_id: number

    @Column({
        type: 'int',
    })
    receiver_id: number

    @ManyToOne(() => Chat, (chat) => chat.messages)
    @JoinColumn({name: "chat"})
    chat: Chat
}
