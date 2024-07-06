Please follow the instructions within ./TODO.md! Thank you :)
### ./src/auth/auth.module.ts
```ts
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
```

### ./src/auth/cookie.strategy.ts
```ts
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
    await this.authService.loadUsers();
    const user = await this.authService.getUser(userId);
    if (!user) {
      console.log('User not found for userId:', userId);
      throw new UnauthorizedException();
    }
    console.log('User found:', user);
    return user;
  }
}
```

### ./src/types/express.d.ts
```ts
import { User } from '../user.model';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
```

### ./src/app.controller.ts
```ts
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
```

### ./src/app.module.ts
```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}

```

### ./src/app.service.ts
```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

```

### ./src/auth.service.ts
```ts
import { Injectable, ConflictException } from '@nestjs/common';
import { User } from './user.model';
import * as bcrypt from 'bcrypt';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuthService {
  private users: User[] = [];
  private stripe: Stripe;
  private readonly usersFilePath: string;

  constructor(private configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in the environment variables');
    }
    this.stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
    
    // Set up file storage for users
    this.usersFilePath = path.join(__dirname, '../data', 'users.json');
    this.loadUsers();
  }

  loadUsers() {
    try {
      if (fs.existsSync(this.usersFilePath)) {
        const data = fs.readFileSync(this.usersFilePath, 'utf8');
        this.users = JSON.parse(data);
        console.log('Users loaded from file');
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  saveUsers() {
    try {
      fs.writeFileSync(this.usersFilePath, JSON.stringify(this.users, null, 2));
      console.log('Users saved to file');
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  async register(email: string, password: string): Promise<User> {
    // Check if user already exists
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let stripeCustomerId: string;

    try {
      // Check if customer already exists in Stripe
      const existingCustomers = await this.stripe.customers.list({ email: email, limit: 1 });
      
      if (existingCustomers.data.length > 0) {
        // Customer already exists, use the existing customer ID
        stripeCustomerId = existingCustomers.data[0].id;
        console.log(`Using existing Stripe customer: ${stripeCustomerId}`);
      } else {
        // Customer doesn't exist, create a new one
        const newCustomer = await this.stripe.customers.create({ email });
        stripeCustomerId = newCustomer.id;
        console.log(`Created new Stripe customer: ${stripeCustomerId}`);
      }
    } catch (error) {
      console.error('Error with Stripe operation:', error);
      throw new Error('Failed to process Stripe customer');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      stripeCustomerId,
    };

    this.users.push(newUser);
    this.saveUsers();
    console.log('User registered:', newUser.email);
    return newUser;
  }

  async login(email: string, password: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email);
    if (user && await bcrypt.compare(password, user.password)) {
      console.log('User logged in:', user.email);
      return user;
    }
    return null;
  }

  async getUser(id: string): Promise<User | undefined> {
    console.log('Getting user with id:', id);
    const user = this.users.find(u => u.id === id);
    console.log('Found user:', user);
    return user;
  }
}
```

### ./src/main.ts
```ts
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  app.use(cookieParser());

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
}
bootstrap();
```

### ./src/user.model.ts
```ts
export class User {
  id: string;
  email: string;
  password: string;
  stripeCustomerId?: string;
}
```

### ./views/login.ejs
```ejs
<!DOCTYPE html>
<html>

<head>
  <title>Login</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/foundation-sites@6.7.5/dist/css/foundation.min.css">
  <script src="https://unpkg.com/htmx.org@1.6.1"></script>
</head>

<body>
  <div class="top-bar">
    <div class="top-bar-left">
      <ul class="menu">
        <li class="menu-text">FleetVRP</li>
        <li><a href="/">Home</a></li>
      </ul>
    </div>
  </div>

  <div class="grid-container">
    <div class="grid-x grid-padding-x align-center">
      <div class="cell medium-6">
        <h2 class="text-center">Login</h2>
        <form action="/login" method="POST">
          <label>Email
            <input type="email" name="email" required>
          </label>
          <label>Password
            <input type="password" name="password" required>
          </label>
          <button type="submit" class="button expanded">Login</button>
        </form>
        <p class="text-center">Don't have an account? <a href="/register">Register</a></p>
      </div>
    </div>
  </div>
</body>

</html>
```

### ./views/register.ejs
```ejs
<!DOCTYPE html>
<html>

<head>
  <title>Register</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/foundation-sites@6.7.5/dist/css/foundation.min.css">
  <script src="https://unpkg.com/htmx.org@1.6.1"></script>
</head>

<body>
  <div class="top-bar">
    <div class="top-bar-left">
      <ul class="menu">
        <li class="menu-text">FleetVRP</li>
        <li><a href="/">Home</a></li>
      </ul>
    </div>
  </div>
  
  <div class="grid-container">
    <div class="grid-x grid-padding-x align-center">
      <div class="cell medium-6">
        <h2 class="text-center">Register</h2>
        <form action="/register" method="POST">
          <label>Email
            <input type="email" name="email" required>
          </label>
          <label>Password
            <input type="password" name="password" required>
          </label>
          <button type="submit" class="button expanded">Register</button>
        </form>
        <p class="text-center">Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  </div>
</body>

</html>
```

### ./views/dashboard.ejs
```ejs
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/foundation-sites@6.7.5/dist/css/foundation.min.css">
    <script src="https://unpkg.com/htmx.org@1.6.1"></script>
</head>
<body>
    <div class="grid-container">
        <div class="grid-x grid-padding-x align-center">
            <div class="cell medium-6">
                <h2 class="text-center">Welcome, <%= user.email %>!</h2>
                <p>Your Stripe Customer ID: <%= user.stripeCustomerId %></p>
                <form action="/logout" method="POST">
                    <button type="submit" class="button expanded">Logout</button>
                </form>
            </div>
        </div>
    </div>
</body>
</html>
```

### ./CURRENT_ERROR.md
```md

```

### ./TODO.md
```md
after todo: i will update my code base with the submitted files and run
the program ... if there is an error then it will be placed within ./CURRENT_ERROR.md
otherwise assume i have updated my requirements.

durring todo: if there is an error within ./CURRENT_ERROR.md then help me solve that
otherwise don't worry about it and proceed with the following todo rules.

TODO RULES:
 1) return a ./src/<filename>.js file or ./view/<filename>.ejs file
 2) i'd like TypeScript or EJS code in response to my queries!
 3) keep console.log statements for debugging
 4) keep code comments for documentation
 5) use Foundation CSS library
```

