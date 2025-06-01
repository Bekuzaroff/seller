import { MinLength } from "class-validator";

export class CreateCategoryDto {
    @MinLength(3, {message: 'too short name for category'})
    name: string
}
