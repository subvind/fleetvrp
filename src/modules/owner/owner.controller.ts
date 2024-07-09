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
    console.log('create manager', managerData)
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