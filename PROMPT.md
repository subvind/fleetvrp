Please follow the instructions within ./TODO.md! Thank you :)
### ./src/modules/owner/manager.entity.ts
```ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../user.model'; // Adjust the import path as needed

@Entity()
export class Manager {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
```

### ./src/modules/owner/manager.service.ts
```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manager } from './manager.entity';
import { User } from '../../user.model'; // Adjust the import path as needed

@Injectable()
export class ManagerService {
  constructor(
    @InjectRepository(Manager)
    private managerRepository: Repository<Manager>,
  ) {}

  async findAll(search?: string, page: number = 1, limit: number = 20): Promise<Manager[]> {
    const query = this.managerRepository.createQueryBuilder('manager')
      .leftJoinAndSelect('manager.user', 'user');

    if (search) {
      query.where('manager.name LIKE :search OR user.email LIKE :search', { search: `%${search}%` });
    }

    query.skip((page - 1) * limit).take(limit);

    return query.getMany();
  }

  async create(managerData: { name: string, userId: string }): Promise<Manager> {
    const manager = this.managerRepository.create({
      name: managerData.name,
      user: { id: managerData.userId } as User
    });
    return this.managerRepository.save(manager);
  }

  async findOne(id: string): Promise<Manager> {
    return this.managerRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async update(id: string, managerData: { name?: string, userId?: string }): Promise<Manager> {
    const manager = await this.managerRepository.findOne({ where: { id } });
    if (!manager) {
      throw new Error('Manager not found');
    }

    if (managerData.name) {
      manager.name = managerData.name;
    }
    if (managerData.userId) {
      manager.user = { id: managerData.userId } as User;
    }

    return this.managerRepository.save(manager);
  }

  async remove(id: string): Promise<void> {
    await this.managerRepository.delete(id);
  }
}
```

### ./src/modules/owner/owner.controller.ts
```ts
import { Controller, Get, Render, Query, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ManagerService } from './manager.service';
import { UserService } from '../../user.service';
import { Manager } from './manager.entity';

@ApiTags('owner')
@Controller('htmx/modules/owner')
export class OwnerController {
  constructor(
    private managerService: ManagerService,
    private userService: UserService
  ) {}

  @Get('managers/list')
  @Render('modules/owner/managers/list')
  async managersList(
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const managers = await this.managerService.findAll(search, page, limit);
    return {
      layout: false,
      managers,
    };
  }

  @Get('managers/create')
  @Render('modules/owner/managers/create')
  async managersCreate() {
    const users = await this.userService.findAll();
    return { 
      layout: false,
      users,
    };
  }

  @Post('managers')
  async managersCreated(@Body() managerData: { name: string, userId: string }) {
    await this.managerService.create(managerData);
    return this.managersList();
  }

  @Get('managers/view/:id')
  @Render('modules/owner/managers/view')
  async managersView(@Param('id') id: string) {
    const manager = await this.managerService.findOne(id);
    return {
      layout: false,
      manager,
    };
  }

  @Get('managers/edit/:id')
  @Render('modules/owner/managers/edit')
  async managersEdit(@Param('id') id: string) {
    const manager = await this.managerService.findOne(id);
    const users = await this.userService.findAll();
    return {
      layout: false,
      manager,
      users,
    };
  }

  @Put('managers/:id')
  async managersUpdated(@Param('id') id: string, @Body() managerData: { name?: string, userId?: string }) {
    await this.managerService.update(id, managerData);
    return this.managersList();
  }

  @Delete('managers/:id')
  async managersDeleted(@Param('id') id: string) {
    await this.managerService.remove(id);
    return this.managersList();
  }
}
```

### ./src/modules/owner/owner.module.ts
```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerController } from './owner.controller';
import { ManagerService } from './manager.service';
import { Manager } from './manager.entity';
import { UserService } from '../../user.service'; // We'll create this next
import { User } from '../../user.model';

@Module({
  imports: [TypeOrmModule.forFeature([Manager, User])],
  controllers: [OwnerController],
  providers: [ManagerService, UserService],
})
export class OwnerModule {}
```

### ./src/app.controller.ts
```ts
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
```

### ./src/app.module.ts
```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { OwnerModule } from './modules/owner/owner.module';
import { Manager } from './modules/owner/manager.entity';
import * as path from 'path';
import * as fs from 'fs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const volumePath = process.env.VOLUME || path.join(process.cwd(), 'data');
        
        // Ensure the directory exists
        if (!fs.existsSync(volumePath)) {
          fs.mkdirSync(volumePath, { recursive: true });
        }

        const dbPath = path.join(volumePath, configService.get<string>('DATABASE_NAME', 'fleetvrp.sqlite'));

        return {
          type: 'sqlite',
          database: dbPath,
          entities: [Manager],
          synchronize: true, // Set to false in production
        };
      },
      inject: [ConfigService],
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

### ./src/navigation.ts
```ts
export default {
  owner: [
    {
      name: 'Managers',
      description: 'List, create, edit, and delete managers from the app.',
      url: '/modules/owner/sub/managers',
      icon: 'assignment_ind',
      slug: 'managers'
    },
    {
      name: 'Payments',
      description: 'Handle payments integration with Stripe.',
      url: '/modules/owner/sub/payments',
      icon: 'attach_money',
      slug: 'payments'
    },
  ]
}
```

### ./src/user.model.ts
```ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Manager } from './modules/owner/manager.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  stripeCustomerId: string;

  @OneToOne(() => Manager, manager => manager.user, { nullable: true })
  manager?: Manager;
}
```

### ./src/user.service.ts
```ts
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async findAll(): Promise<User[]> {
    let users = await this.cacheManager.get<User[]>('users');
    if (!users) {
      users = await this.userRepository.find();
      await this.cacheManager.set('users', users);
    }
    return users;
  }

  async findOne(id: string): Promise<User | undefined> {
    const users = await this.findAll();
    return users.find(u => u.id === id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const users = await this.findAll();
    return users.find(u => u.email === email);
  }
}
```

### ./views/modules/owner/managers/create.ejs
```ejs
<h3>Create New Manager</h3>
<form hx-post="/htmx/modules/owner/managers" hx-target="#managers-list" hx-swap="outerHTML">
  <div class="input-field">
    <input type="text" id="name" name="name" required>
    <label for="name">Name</label>
  </div>
  <div class="input-field">
    <select id="userId" name="userId" required>
      <option value="" disabled selected>Choose a user</option>
      <% users.forEach(user => { %>
        <option value="<%= user.id %>"><%= user.email %></option>
      <% }); %>
    </select>
    <label for="userId">User</label>
  </div>
  <button class="btn waves-effect waves-light" type="submit">
    Create
    <i class="material-icons right">send</i>
  </button>
</form>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems);
  });
</script>
```

### ./views/modules/owner/managers/edit.ejs
```ejs
<h3>Edit Manager</h3>
<form hx-put="/htmx/modules/owner/managers/<%= manager.id %>" hx-target="#managers-list" hx-swap="outerHTML">
  <div class="input-field">
    <input type="text" id="name" name="name" value="<%= manager.name %>" required>
    <label for="name">Name</label>
  </div>
  <div class="input-field">
    <select id="userId" name="userId" required>
      <% users.forEach(user => { %>
        <option value="<%= user.id %>" <%= user.id === manager.user.id ? 'selected' : '' %>><%= user.email %></option>
      <% }); %>
    </select>
    <label for="userId">User</label>
  </div>
  <button class="btn waves-effect waves-light" type="submit">
    Update
    <i class="material-icons right">send</i>
  </button>
</form>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems);
  });
</script>
```

### ./views/modules/owner/managers/index.ejs
```ejs
<!DOCTYPE html>
<html lang="en">
<%- include('../../head', page); %>
<body class="has-fixed-navi">
  <%- include('../../header', {
    page,
    user,
    moduleName,
    moduleSlug,
    navigation,
  }); %>
  
  <div style="min-height: 100vh;">
    <%- include('../../breadcrumb', {
      links: [
        { name: `Home`, url: `/` },
        { name: `VRP: Owner`, url: `/modules/owner` },
        { name: `Managers`, url: `/modules/owner/sub/managers` },
      ]
    }); %>
    <br />
    <div class="container">
      <h2>Managers</h2>
      
      <!-- HTMX-powered search input -->
      <div class="input-field">
        <input type="text" id="search" name="search" 
               hx-get="/htmx/modules/owner/managers/list"
               hx-trigger="keyup changed delay:500ms"
               hx-target="#managers-list"
               placeholder="Search managers...">
        <label for="search">Search</label>
      </div>

      <!-- Create manager button -->
      <button class="btn waves-effect waves-light"
              hx-get="/htmx/modules/owner/managers/create"
              hx-target="#managers-content">
        Create Manager
        <i class="material-icons right">add</i>
      </button>

      <!-- Managers list -->
      <div id="managers-list" hx-get="/htmx/modules/owner/managers/list" hx-trigger="load">
        <!-- The list will be loaded here -->
      </div>

      <!-- Manager content (for create/edit/view) -->
      <div id="managers-content">
        <!-- The create/edit/view forms will be loaded here -->
      </div>
    </div>
  </div>
  <%- include('../../footer'); %>

  <!-- include htmx -->
  <script src="https://unpkg.com/htmx.org@1.9.11"></script>
  
  <script>
    // Initialize Materialize components
    document.addEventListener('DOMContentLoaded', function() {
      M.updateTextFields();
    });
  </script>
</body>
</html>
```

### ./views/modules/owner/managers/list.ejs
```ejs
<table class="striped">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <% managers.forEach(manager => { %>
      <tr>
        <td><%= manager.name %></td>
        <td><%= manager.email %></td>
        <td>
          <button class="btn-small waves-effect waves-light"
                  hx-get="/htmx/modules/owner/managers/view/<%= manager.id %>"
                  hx-target="#managers-content">
            View
          </button>
          <button class="btn-small waves-effect waves-light"
                  hx-get="/htmx/modules/owner/managers/edit/<%= manager.id %>"
                  hx-target="#managers-content">
            Edit
          </button>
          <button class="btn-small waves-effect waves-light red"
                  hx-delete="/htmx/modules/owner/managers/<%= manager.id %>"
                  hx-confirm="Are you sure you want to delete this manager?"
                  hx-target="#managers-list">
            Delete
          </button>
        </td>
      </tr>
    <% }); %>
  </tbody>
</table>
```

### ./views/modules/owner/managers/view.ejs
```ejs
<h3>Manager Details</h3>
<div>
  <p><strong>Name:</strong> <%= manager.name %></p>
  <p><strong>Email:</strong> <%= manager.email %></p>
  <button class="btn waves-effect waves-light"
          hx-get="/htmx/modules/owner/managers/edit/<%= manager.id %>"
          hx-target="#managers-content">
    Edit
    <i class="material-icons right">edit</i>
  </button>
</div>
```

### ./views/modules/owner/index.ejs
```ejs
<!DOCTYPE html>
<html lang="en">
<%- include('../head', page); %>
<body class="has-fixed-navi">
  <%- include('../header', {
    page,
    user,
    moduleName,
    moduleSlug,
    navigation,
  }); %>
  
  <div style="min-height: 100vh;">
    <%- include('../breadcrumb', {
      links: [
        { name: `Home`, url: `/` },
        { name: `VRP: Owner`, url: `/modules/owner` },
      ]
    }); %>
    <br />
    <%- include('../navigation', { navigation }); %>
  </div>
  <%- include('../footer'); %>
  <%- // include('session'); %>

  <!-- include htmx -->
  <script src="https://unpkg.com/htmx.org@1.9.11"></script>
</body>
</html>
```

### ./CURRENT_ERROR.md
```md
[Nest] 91946  - 07/09/2024, 2:25:16 PM   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (1)...
TypeORMError: Entity metadata for Manager#user was not found. Check if you specified a correct entity object and if it's connected in the connection options.
    at <anonymous> (/Users/subvind/Projects/fleetvrp/node_modules/typeorm/metadata-builder/src/metadata-builder/EntityMetadataBuilder.ts:1121:23)
    at Array.forEach (<anonymous>)
    at EntityMetadataBuilder.computeInverseProperties (/Users/subvind/Projects/fleetvrp/node_modules/typeorm/metadata-builder/src/metadata-builder/EntityMetadataBuilder.ts:1111:34)
    at <anonymous> (/Users/subvind/Projects/fleetvrp/node_modules/typeorm/metadata-builder/src/metadata-builder/EntityMetadataBuilder.ts:158:18)
    at Array.forEach (<anonymous>)
    at EntityMetadataBuilder.build (/Users/subvind/Projects/fleetvrp/node_modules/typeorm/metadata-builder/src/metadata-builder/EntityMetadataBuilder.ts:157:25)
    at ConnectionMetadataBuilder.buildEntityMetadatas (/Users/subvind/Projects/fleetvrp/node_modules/typeorm/connection/src/connection/ConnectionMetadataBuilder.ts:106:11)
    at DataSource.buildMetadatas (/Users/subvind/Projects/fleetvrp/node_modules/typeorm/data-source/src/data-source/DataSource.ts:710:13)
    at DataSource.initialize (/Users/subvind/Projects/fleetvrp/node_modules/typeorm/data-source/src/data-source/DataSource.ts:263:13)
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
 5) use mdui CSS library
 6) save records to sqlite database using TypeORM
```

