import {Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('/api/v1/user/')
export class AuthController {
    constructor(private readonly service: AuthService){}

    @HttpCode(201)
    @Post('create')
    sign_up(@Body() user: CreateUserDto){
        return this.service.sign_up(user);
    }

    @HttpCode(200)
    @Post('login')
    login(@Body() user: LoginUserDto){
        return this.service.login(user);
    }
}

