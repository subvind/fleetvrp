import { Controller, Get, Render, Query, Post, Body, Param, Put, Delete, HttpCode } from '@nestjs/common';
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
    const { managers, total } = await this.managerService.findAll(search, page, limit);
    const totalPages = Math.ceil(total / limit);
    return {
      layout: false,
      managers,
      currentPage: page,
      totalPages,
      limit,
      search,
      total
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
  @HttpCode(200)
  @Render('modules/owner/managers/list')
  async managersCreated(
    @Body() managerData: { name: string, userId: string },
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    console.log('create manager', managerData);
    await this.managerService.create(managerData);
    const { managers, total } = await this.managerService.findAll(search, page, limit);
    const totalPages = Math.ceil(total / limit);
    return {
      layout: false,
      managers,
      currentPage: page,
      totalPages,
      limit,
      search,
      total
    };
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
  @Render('modules/owner/managers/list')
  async managersUpdated(
    @Param('id') id: string,
    @Body() managerData: { name?: string, userId?: string },
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    await this.managerService.update(id, managerData);
    const { managers, total } = await this.managerService.findAll(search, page, limit);
    const totalPages = Math.ceil(total / limit);
    return {
      layout: false,
      managers,
      currentPage: page,
      totalPages,
      limit,
      search,
      total
    };
  }

  @Delete('managers/:id')
  @HttpCode(200)
  @Render('modules/owner/managers/list')
  async managersDeleted(
    @Param('id') id: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    await this.managerService.remove(id);
    const { managers, total } = await this.managerService.findAll(search, page, limit);
    const totalPages = Math.ceil(total / limit);
    return {
      layout: false,
      managers,
      currentPage: page,
      totalPages,
      limit,
      search,
      total
    };
  }
}