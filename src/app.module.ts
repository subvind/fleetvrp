import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { OwnerModule } from './modules/owner/owner.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      }),
    CacheModule.register({
      isGlobal: true,
      ttl: 86400000, // 1 day in ms
      max: 100, // maximum number of items in cache
    }),
    AuthModule,
    OwnerModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}
