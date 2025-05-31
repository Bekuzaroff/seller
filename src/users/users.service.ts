import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import ms from 'ms';
@Injectable()
export class UsersService {
    constructor(
        private readonly configService: ConfigService
    ){

    }
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
    
        async comparePasswordsLogin(req_password: string, db_hashed_password: string){
            return await bcrypt.compare(req_password, db_hashed_password);
        }
    
        async hash_password(info, salt_rounds){
            return await bcrypt.hash(info, salt_rounds);
        }
}
