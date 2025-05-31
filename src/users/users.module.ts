import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [UsersController],
  providers: [ConfigModule, UsersService],
  exports: [UsersService]
})
export class UsersModule {}
