import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { CookieStrategy } from './cookie.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PassportModule, ConfigModule],
  providers: [AuthService, CookieStrategy],
  exports: [AuthService],
})
export class AuthModule {}