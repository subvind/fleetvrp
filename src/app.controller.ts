import { Controller, Get, Post, Render, Body, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user.model';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @Get()
  @Render('index')
  root() {
    return { message: 'Vehicle Routing Problem' };
  }

  @Get('login')
  @Render('login')
  loginPage() {
    return {};
  }

  @Get('register')
  @Render('register')
  registerPage() {
    return {};
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.login(body.email, body.password);
    if (user) {
      res.cookie('userId', user.id, { httpOnly: true });
      return res.redirect('/dashboard');
    }
    return res.redirect('/login?error=1');
  }
  
  @Post('register')
  async register(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.register(body.email, body.password);
    res.cookie('userId', user.id, { httpOnly: true });
    return res.redirect('/dashboard');
  }

  @Get('dashboard')
  @UseGuards(AuthGuard('cookie'))
  @Render('dashboard')
  dashboard(@Req() req: Request) {
    return { user: req.user as User };
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('userId');
    return res.redirect('/');
  }
}