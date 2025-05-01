import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthService } from './auth.service';

@Controller('/api/v1/user/')
export class AuthController {
    constructor(private readonly auth_service: AuthService){

    }
    @Post('create')
    sign_up(@Body() user: CreateUserDto){
        return this.auth_service.sign_up(user);
    }
}
