import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { UserEntity } from 'src/auth/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, UserEntity]), UsersModule, CommonModule, RedisModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
