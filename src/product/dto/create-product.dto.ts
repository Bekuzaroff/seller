import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateProductDto {
    @IsString({message: 'name should be a string'})
    @MinLength(3, {message: 'name of your product is too short'})
    name: string

    @IsString({message: 'description should be a string'})
    @MinLength(10, {message: 'your description is too short'})
    description: string

    @IsNumber({}, {message: 'price should be a number'})
    price: number

    @IsArray({message: 'images should be an array of string'})
    images: string[]

    @IsBoolean({message: 'is_new should be boolean'})
    @IsOptional()
    is_new: boolean

    @IsNumber({}, {message: 'user_id should be a number'})
    user_id: number

}
