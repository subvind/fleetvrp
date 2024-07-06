import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    console.log('Validating userId:', userId);
    const user = await this.authService.getUser(userId);
    if (!user) {
      console.log('User not found for userId:', userId);
      throw new UnauthorizedException();
    }
    console.log('User found:', user);
    return user;
  }
}