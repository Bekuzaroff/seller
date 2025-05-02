import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/login-user.dto';

@Controller('/api/v1/user/')
export class AuthController {
    constructor(private readonly service: AuthService){}

    @Post('login')
    login(@Body() user: LoginUserDto){
        return this.service.login(user);
    }
}
