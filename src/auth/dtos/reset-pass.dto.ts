import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";
import { IsString, MinLength } from "class-validator";

export class ResetPasswordDto{
    @IsString()
    @MinLength(6)
    new_password: string
}