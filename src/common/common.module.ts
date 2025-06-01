import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminCheckGuard } from './guards/admin-check.guard';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), UsersModule, forwardRef(() => AuthModule)],
  providers: [JwtAuthGuard, AdminCheckGuard],
  exports: [JwtAuthGuard, AdminCheckGuard]
})
export class CommonModule {}
