import { IsEmail, IsString } from "class-validator"

export class LoginUserDto{
    @IsString({message: 'email should be a string'})
    @IsEmail({}, {message: 'wrong email format'})
    email: string
    @IsString({message: 'password should be a string'})
    password: string
}