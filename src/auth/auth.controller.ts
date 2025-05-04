import {Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { Request, Response } from 'express';

@Controller('/api/v1/user/')
export class AuthController {
    constructor(private readonly service: AuthService){}

    @HttpCode(201)
    @Post('create')
    sign_up(@Body() user: CreateUserDto, @Res() res: Response){
        return this.service.sign_up(user, res);
    }

    @HttpCode(200)
    @Post('login')
    login(@Body() user: LoginUserDto, @Res() res: Response, @Req() req: Request){
        return this.service.login(user, res, req);
    }

    @HttpCode(200)
    @Post('logout')
    logout(@Req() req: Request, @Res() res: Response){
        return this.service.logout(req, res);
    }

    @HttpCode(200)
    @Post('token_refresh')
    refresh(@Res() res: Response, @Req() req: Request){
        return this.service.refresh(res, req);
    }
}

