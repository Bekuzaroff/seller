import {Body, Controller, HttpCode, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ResetPasswordDto } from './dtos/reset-pass.dto';

@Controller('/api/v1/auth/')
export class AuthController {
    constructor(private readonly service: AuthService){}

    @HttpCode(201)
    @Post('user/new')
    sign_up(@Body() user: CreateUserDto, @Res() res: Response, @Query("admin_id") admin_id ?: string){
        return this.service.sign_up(user, res, admin_id);
    }

    @HttpCode(200)
    @Post('user')
    login(@Body() user: LoginUserDto, @Res() res: Response){
        return this.service.login(user, res);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @Post('user/out')
    async logout(@Req() req: any, @Res() res: Response){
        return this.service.logout(req, res);
    }

    @HttpCode(200)
    @Post('token/refresh')
    refresh(@Req() req: Request, @Res() res: Response){
        return this.service.refresh(req, res);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @Patch('password')
    change_password(@Req() req: any, @Body() updateUserDto: UpdateUserDto){
        return this.service.change_password(req, updateUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @Patch('details')
    change_details(@Req() req: any, @Body() updateUserDto: UpdateUserDto){
        return this.service.change_details(req, updateUserDto);
    }

    @Post('password/forgot')
    forgot_password(@Body() updateUserDto: UpdateUserDto){
        return this.service.forgot_password(updateUserDto);
    }

    @Post('password/reset')
    reset_password(@Query('token') token: string, @Body() resetPasswordDto: ResetPasswordDto){
        return this.service.reset_password(token, resetPasswordDto);
    }
}

