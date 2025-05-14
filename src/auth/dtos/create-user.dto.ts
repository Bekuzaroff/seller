import { IsArray, IsEmail, IsString, MinLength } from "class-validator"
import { Match } from "./../decorators/match-decorator"
import { Product } from "src/product/entities/product.entity"


export class CreateUserDto{
    user_id: number

    @MinLength(5, {message: 'too short user name'})
    @IsString()
    user_name: string

    @IsEmail({}, {message: 'wrong email'})
    @IsString()
    email: string

    @MinLength(6)
    @IsString()
    password: string

    @IsString()
    @Match('password', {message: 'your passwords do not match'})
    confirm_password: string

    refresh_token: string | null
}