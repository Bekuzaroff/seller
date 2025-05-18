import { IsNumber } from "class-validator";

export class ChatDto {

    @IsNumber()
    own_user_id: number

    @IsNumber()
    other_user_id: number
}
