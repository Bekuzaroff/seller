import { CanActivate, ExecutionContext, HttpException, Inject, Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class JwtAuthGuard implements CanActivate{
    constructor(private readonly service: AuthService,
        @InjectRepository(UserEntity)
        readonly repository: Repository<UserEntity>
    ){}
    async canActivate(context: ExecutionContext): Promise<boolean>{
        const req: any = context.switchToHttp().getRequest();
        const access_token = req.headers['authorization'].split(' ')[1];

        if(!access_token){
            throw new HttpException('you are not logged in', 400);
        } 

        let payload: any
        payload = this.service.verify_token(access_token);

        let user: any
        user = await this.repository.findOne({
            where: {
                user_id: payload.sub
            },
            relations: ['liked_products']
        });

        if(!user){
            throw new HttpException('such user does not exist', 404)
        }
        
        req.user = user;
        
        return true;
    }

}
