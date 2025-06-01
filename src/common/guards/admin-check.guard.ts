import { CanActivate, ExecutionContext, HttpException } from "@nestjs/common";
import { Observable } from "rxjs";

export class AdminCheckGuard implements CanActivate{
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        
        if(req.user.role !== "Admin"){
            throw new HttpException("you are not allowed to such operations", 400);
        }

        return true;
    }
}