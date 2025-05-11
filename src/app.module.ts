import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({
    isGlobal: true
  }), TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
      type: "postgres",
      host: configService.get<string>('DB_HOST'),
      port: configService.get<number>('DB_PORT'),
      username: configService.get<string>('DB_USER_NAME'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DATA_BASE'),
      synchronize: true,
      autoLoadEntities: true
    })
  }), ProductModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
