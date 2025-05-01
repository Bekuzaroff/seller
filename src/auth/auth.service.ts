import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repository: Repository<UserEntity>,
        private readonly configService: ConfigService
    ){
    }

    async sign_jwt(id: number){
        return jwt.sign({id}, this.configService.get<string>('JWT_SECRET_STR') ?? '', {
            expiresIn: this.configService.get<number>('JWT_EXPIRES')
        })
    }

    async sign_up(user: CreateUserDto){
        try{
            const new_user = this.repository.create(user);
            
            const salt_rounds = 10;
            new_user.password = await bcrypt.hash(new_user.password, salt_rounds);

            await this.repository.save(new_user);

            const token = await this.sign_jwt(new_user.user_id);

            return {
                status: 'success',
                data: token
            }
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
}
