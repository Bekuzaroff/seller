import { Column, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./message.entity";

import { Index } from 'typeorm';

@Index(['user1_id', 'user2_id'], { unique: true })
@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  chat_id: number;

  @Column()
  user1_id: number;

  @Column()
  user2_id: number;

  @OneToMany(() => Message, (msg) => msg.chat)
  messages: Message[];
}
