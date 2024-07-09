import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '../auth.service';
// import { LocalStrategy } from './local.strategy';
import { CookieStrategy } from './cookie.strategy';
import { User } from '../user.model';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    AuthService,
    // LocalStrategy, 
    CookieStrategy
  ],
  exports: [AuthService],
})
export class AuthModule {}