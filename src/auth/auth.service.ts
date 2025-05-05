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
            
            const salt_rounds = 10;
            new_user.password = await this.hash_password(new_user.password, salt_rounds)

            const access_token = await this.sign_jwt(new_user.user_id, "15m");
            const refresh_token = await this.sign_jwt(new_user.user_id, "15d");

            new_user.refresh_token = refresh_token;

            await this.repository.save(new_user);

            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: true ? process.env.NODE_ENV === 'production' : false,
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

    async login(user: LoginUserDto, res: Response, req: Request){
        try{
            const existing_user = await this.repository.findOne(
                {where: {
                    email: user.email
                }}
            )
    
            if(!existing_user){
                throw new NotFoundException('user with such email does not exist');
            }

            if(!(await this.comparePasswordsLogin(user.password, existing_user.password))){
                throw new BadRequestException('wrong password');
            }

            const access_token = await this.sign_jwt(existing_user.user_id, "15m");
            const refresh_token = await this.sign_jwt(existing_user.user_id, "15d");

            existing_user.refresh_token = refresh_token;
            await this.repository.save(existing_user);

            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: true ? process.env.NODE_ENV === 'production' : false,
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

    

    async logout(req: Request, res: Response){
        const refresh_token_cookie = req.cookies['refresh_token'];

        if(!refresh_token_cookie){
            throw new HttpException('refresh token is not provided', 404);
        }

        let payload: any;
        payload = this.verify_token(refresh_token_cookie);

        const existing_user = await this.repository.findOne({
            where: {user_id: payload.sub}
        });

        if(!existing_user){
            throw new HttpException("such user does not exist", 404);
        }

        existing_user.refresh_token = null;
        await this.repository.save(existing_user);

        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: true ? process.env.NODE_ENV === 'production' : false,
            sameSite: 'strict',
            path: '/api/v1/user/refresh'
        });

        res.json({
            status: 'success',
            data: 'logout successfully'
        });

    }

    async refresh(res: Response, req: Request){
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
            secure: true ? process.env.NODE_ENV === 'production' : false,
            sameSite: 'strict',
            path: '/api/v1/user/refresh',
            maxAge: 5 * 24 * 60 * 60 * 1000
        });
        res.json({
            status: 'success',
            data: access_token
        });
    }
}

