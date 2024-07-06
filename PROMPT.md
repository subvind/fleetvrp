Please follow the instructions within ./TODO.md! Thank you :)
### ./src/app.controller.ts
```ts
import { Controller, Get, Post, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  root() {
    return { message: 'Hello HTMX!' };
  }

  @Post('greet')
  greet() {
    return '<p>Hello from HTMX!</p>';
  }
}
```

### ./src/app.module.ts
```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
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

### ./src/main.ts
```ts
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  await app.listen(3000);
}
bootstrap();
```

### ./views/index.ejs
```ejs
<!DOCTYPE html>
<html>
<head>
    <title>HTMX + NestJS with EJS</title>
    <script src="https://unpkg.com/htmx.org@1.6.1"></script>
</head>
<body>
    <h1><%= message %></h1>
    <button hx-post="/greet" hx-swap="outerHTML">
        Click me
    </button>
</body>
</html>
```

### ./CURRENT_ERROR.md
```md
code a login/register page that integrates with stripe customers then make the rest of the app protected
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

