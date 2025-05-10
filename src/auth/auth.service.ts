import { BadRequestException, ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { LoginUserDto } from './dtos/login-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Request, Response } from 'express';
import { UpdateUserDto } from './dtos/update-user.dto';
import * as nodemailer from 'nodemailer';
import { ResetPasswordDto } from './dtos/reset-pass.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repository: Repository<UserEntity>,
        private readonly configService: ConfigService
    ){}

    verify_token(token: string){
        try{
            const payload = jwt.verify(token, this.configService.get<string>('JWT_SECRET_STR') ?? '');
            return payload;
        }catch(e){
            if(e.name === 'TokenExpiredError'){
                throw new HttpException('token expired', 403);
            }else{
                throw new HttpException('wrong token', 400);
            }
        }
    }

    async sign_jwt(id: number, exp_time: ms.StringValue){
        return jwt.sign({sub: id}, this.configService.get<string>('JWT_SECRET_STR') ?? '', {
            expiresIn: exp_time
        })
    }

    private async comparePasswordsLogin(req_password: string, db_hashed_password: string){
        return await bcrypt.compare(req_password, db_hashed_password);
    }

    async hash_password(info, salt_rounds){
        return await bcrypt.hash(info, salt_rounds);
    }

    async sign_up(user: CreateUserDto, res: Response){
        try{
            const new_user = this.repository.create(user);
            
            new_user.password = await this.hash_password(new_user.password, 10)

            const access_token = await this.sign_jwt(new_user.user_id, "15m");
            const refresh_token = await this.sign_jwt(new_user.user_id, "15d");

            new_user.refresh_token = refresh_token;

            await this.repository.save(new_user);

            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/api/v1/user/refresh',
                maxAge: 5 * 24 * 60 * 60 * 1000
            });

            res.json({
                status: 'success',
                data: access_token
            })
        }catch(e){
            if(e.code === '23505'){
                let unique_field = '';

                if(e.detail.includes('user_name')){
                    unique_field = "user name";
                }else{
                    unique_field = "email";
                }

                throw new ConflictException(`user with such ${unique_field} already exists`);
            };
            throw e;
        }
    }

    async login(user: LoginUserDto, res: Response){
        try{
            const existing_user = await this.repository.findOne(
                {where: {
                    email: user.email
                }}
            )

            if(!existing_user){
                throw new NotFoundException('user with such email does not exist');
            }

            if(!(await this.comparePasswordsLogin(user.password!, existing_user.password))){
                throw new BadRequestException('wrong password');
            }

            const access_token = await this.sign_jwt(existing_user.user_id, "15m");
            const refresh_token = await this.sign_jwt(existing_user.user_id, "15d");

            existing_user.refresh_token = refresh_token;
            await this.repository.save(existing_user);

            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/api/v1/user/refresh',
                maxAge: 5 * 24 * 60 * 60 * 1000
            });

            res.json({
                status: 'success',
                data: access_token
            });
            
        }catch(err){
            throw err;
        }
    }

    

    async logout(req: any, res: Response){
        const user = req.user

        user.refresh_token = null;
        await this.repository.save(user);

        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/v1/user/refresh'
        });

        res.json({
            status: 'success',
            data: 'logout successfully'
        });

    }

    async refresh(req: Request, res: Response){
        const refresh_token_cookie = req.cookies['refresh_token'];

        if(!refresh_token_cookie){
            throw new HttpException("no token in cookie", 404);
        }
        
        let payload: any;
        payload = this.verify_token(refresh_token_cookie);

        const existing_user = await this.repository.findOne({
            where: {user_id: payload.sub}
        });

        if(!existing_user){
            throw new HttpException("such user does not exist", 404);
        }

        if(refresh_token_cookie !== existing_user.refresh_token){
            throw new HttpException('refresh token mismatch', 403);
        }
        
        const access_token = await this.sign_jwt(existing_user.user_id, "15m");
        const refresh_token = await this.sign_jwt(existing_user.user_id, "15d");

        existing_user.refresh_token = refresh_token;
        await this.repository.save(existing_user);

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/v1/user/refresh',
            maxAge: 5 * 24 * 60 * 60 * 1000
        });
        res.json({
            status: 'success',
            data: access_token
        });
    }  
    async forgot_password(updateUserDto: UpdateUserDto){
        const email = updateUserDto.email;
        if(!email){
            throw new HttpException('please, provide your email', 400);
        }

        const user = await this.repository.findOne({
            where: {email}
        });

        if(!user){
            throw new HttpException('user with such email does not exist', 404);
        }
        const token = await this.sign_jwt(user.user_id, "5m");
        const reset_link = `${this.configService.get<string>('CLIENT_URL')}/api/v1/user/reset_password?token=${token}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get<string>('USER_EMAIL'),
                pass: this.configService.get<string>('USER_PASSWORD')
            }
        });

        const mailOptions = {
            from: this.configService.get<string>('USER_EMAIL'),
            to: user.email,
            subject: 'Reset password',
            html: `<p> press this link: <a href="${reset_link}" </a> to reset your password.</p>`
        }

        try{
            await transporter.sendMail(mailOptions);
            return {
                status: 'success',
                data: 'we have sent letter to reset password to your email'
            }
        }catch(err){
            throw err;
        }
    }

    async reset_password(token: string, resetPasswordDto: ResetPasswordDto){
        try{
            const new_password_hashed = await this.hash_password(resetPasswordDto.new_password, 10);

        let decoded_token: any
        decoded_token = this.verify_token(token);

        const user = await this.repository.findOne({
            where: {
                user_id: decoded_token.sub
            }
        });

        if(!user){
            throw new HttpException('user with such email does not exist', 404);
        }

        await this.repository.update({user_id: user.user_id}, {password: new_password_hashed});

        return {
            status: 'success',
            data: 'reset password successfully, you can now login with your new password'
        };
        
        }catch(err){
            throw err;
        }
    }

    async change_password(req: any, updateUserDto: UpdateUserDto){
        const user = req.user;
        
        if(!(await this.comparePasswordsLogin(updateUserDto.old_password, user.password))){
            throw new HttpException('wrong old password', 400);
        }

        user.password = await this.hash_password(updateUserDto.password, 10);

        await this.repository.save(user);

        return {
            status: 'success',
            data: 'changed password successfully'
        }
    }

    async change_details(req: any, updateUserDto: UpdateUserDto){
        try{
            if(updateUserDto.password){
                throw new HttpException('you should update your password separatly', 400);
            }
            
            await this.repository.update({user_id: req.user.user_id}, updateUserDto);
    
            req.user = await this.repository.findOne({
                where:{
                    user_id: req.user.user_id
                }
            });
    
            return {
                status: 'success',
                data: 'changed details successfully'
            }
        }catch(err){
            if(err.code === '23505'){
                throw new HttpException('user with such field already exists', 400);
            }
        }
    }
}

