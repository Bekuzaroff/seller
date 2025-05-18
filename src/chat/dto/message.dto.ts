import { IsNumber, IsString } from "class-validator"

export class MessageDto{
    @IsString()
    message: string

    @IsNumber()
    sender_id: number

    @IsNumber()
    receiver_id: number
}