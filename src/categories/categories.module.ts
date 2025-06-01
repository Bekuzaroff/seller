import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { UserEntity } from 'src/auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, UserEntity]), CommonModule, UsersModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, ConfigModule],
})
export class CategoriesModule {}
