import { Controller, Get, Post, Render, Body, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user.model';
import navigation from './navigation';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @Get()
  @Render('index')
  async root(@Req() req: Request) {
    let user: User | undefined;
    const userId = req.cookies['userId'];
    if (userId) {
      user = await this.authService.getUser(userId);
    }

    return { user, message: 'Vehicle Routing Problem' };
  }

  @Get('vehicle-routing-problem')
  @Render('vehicle-routing-problem')
  async dashboard(@Req() req: Request) {
    let user: User | undefined;
    const userId = req.cookies['userId'];
    if (userId) {
      user = await this.authService.getUser(userId);
    }

    return { user, message: 'White Paper' };
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
      return res.redirect('/');
    }
    return res.redirect('/login?error=1');
  }
  
  @Post('register')
  async register(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.register(body.email, body.password);
    res.cookie('userId', user.id, { httpOnly: true });
    return res.redirect('/');
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('userId');
    return res.redirect('/');
  }

  @Get('modules/owner')
  @UseGuards(AuthGuard('cookie'))
  @Render('modules/owner/index')
  async getAppOwnerIndex(@Req() req: Request) {
    return {
      user: req.user as User,
      page: {
        metaTitle: 'Owner - FleetVRP',
      },
      moduleName: 'VRP: Owner',
      moduleSlug: 'owner',
      subModuleSlug: '',
      navigation: navigation.owner
    };
  }

  @Get('modules/owner/sub/managers')
  @UseGuards(AuthGuard('cookie'))
  @Render('modules/owner/managers/index')
  async getAppOwnerManagersIndex(@Req() req: Request) {
    return {
      user: req.user as User,
      page: {
        metaTitle: 'Managers - Owner - FleetVRP',
      },
      moduleName: 'VRP: Owner',
      moduleSlug: 'owner',
      subModuleSlug: 'managers',
      navigation: navigation.owner
    };
  }

  @Get('modules/owner/sub/payments')
  @UseGuards(AuthGuard('cookie'))
  @Render('modules/owner/payments/index')
  async getAppOwnerPaymentsIndex(@Req() req: Request) {
    return {
      user: req.user as User,
      page: {
        metaTitle: 'Payments - Owner - FleetVRP',
      },
      moduleName: 'VRP: Owner',
      moduleSlug: 'owner',
      subModuleSlug: 'payments',
      navigation: navigation.owner
    };
  }
}