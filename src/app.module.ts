import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { OwnerModule } from './modules/owner/owner.module';
import { Manager } from './modules/owner/manager.entity';
import { User } from './user.model';
import * as path from 'path';
import * as fs from 'fs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const volumePath = process.env.VOLUME || path.join(process.cwd(), 'data');
        
        // Ensure the directory exists
        if (!fs.existsSync(volumePath)) {
          fs.mkdirSync(volumePath, { recursive: true });
        }

        const dbPath = path.join(volumePath, configService.get<string>('DATABASE_NAME', 'fleetvrp.sqlite'));

        return {
          type: 'sqlite',
          database: dbPath,
          entities: [Manager, User],
          synchronize: true, // Set to false in production
        };
      },
      inject: [ConfigService],
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 86400000, // 1 day in ms
      max: 100, // maximum number of items in cache
    }),
    AuthModule,
    OwnerModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}