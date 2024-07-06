import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { CookieStrategy } from './cookie.strategy';

@Module({
  imports: [PassportModule],
  providers: [AuthService, CookieStrategy],
  exports: [AuthService],
})
export class AuthModule {}