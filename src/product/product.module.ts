import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserEntity } from 'src/auth/entities/user.entity';
import { RedisService } from './redis.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, UserEntity]), AuthModule, UsersModule],
  controllers: [ProductController],
  providers: [ProductService, RedisService],
})
export class ProductModule {}
