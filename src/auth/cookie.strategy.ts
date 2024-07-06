import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-cookie';
import { AuthService } from '../auth.service';

@Injectable()
export class CookieStrategy extends PassportStrategy(Strategy, 'cookie') {
  constructor(private authService: AuthService) {
    super({
      cookieName: 'userId',
      signed: false,
    });
  }

  async validate(userId: string): Promise<any> {
    const user = await this.authService.getUser(userId);
    if (!user) {
      return null;
    }
    return user;
  }
}