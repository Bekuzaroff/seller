import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), ConfigModule],
  providers: [AuthService, JwtAuthGuard],
  controllers: [AuthController],
  exports: [JwtAuthGuard, AuthService]
})
export class AuthModule {}
