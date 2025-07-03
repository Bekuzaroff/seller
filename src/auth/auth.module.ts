import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), ConfigModule, UsersModule],
  providers: [AuthService, UserEntity],
  controllers: [AuthController],
  exports: [AuthService, UserEntity]
})
export class AuthModule {}
