import {Body, Controller, HttpCode, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ResetPasswordDto } from './dtos/reset-pass.dto';

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
    login(@Body() user: LoginUserDto, @Res() res: Response){
        return this.service.login(user, res);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @Post('logout')
    async logout(@Req() req: any, @Res() res: Response){
        return this.service.logout(req, res);
    }

    @HttpCode(200)
    @Post('token_refresh')
    refresh(@Req() req: Request, @Res() res: Response){
        return this.service.refresh(req, res);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @Patch('change_password')
    change_password(@Req() req: any, @Body() updateUserDto: UpdateUserDto){
        return this.service.change_password(req, updateUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @Patch('change_details')
    change_details(@Req() req: any, @Body() updateUserDto: UpdateUserDto){
        return this.service.change_details(req, updateUserDto);
    }

    @Post('forgot_password')
    forgot_password(@Body() updateUserDto: UpdateUserDto){
        return this.service.forgot_password(updateUserDto);
    }

    @Post('reset_password')
    reset_password(@Query('token') token: string, @Body() resetPasswordDto: ResetPasswordDto){
        return this.service.reset_password(token, resetPasswordDto);
    }
}

