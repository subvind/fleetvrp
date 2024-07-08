import { Controller, Get, Render, Req, Query, Post, Body, Param } from '@nestjs/common';

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('owner')
@Controller('htmx/modules/owner')
export class OwnerController {
  constructor() {}

  @Get('managers/view')
  @Render('modules/owner/managers/view')
  managersView() {
    return { 
      layout: false,
      // view: data
    };
  }

  @Get('managers/list')
  @Render('modules/owner/managers/list')
  async managersList(
    @Query('config') config: string = 'OrderByLatest',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
  ) {
    return {
      layout: false,
      // list: data
    };
  }

  @Get('managers/create')
  @Render('modules/owner/managers/create')
  managersCreate() {
    return { 
      layout: false,
    };
  }

  @Post('managers')
  @Render('modules/owner/managers/created')
  async managersCreated(
    @Body() productData: any
  ) {
    return {
      layout: false,
      // created: data
    }
  }

  @Get('managers/table')
  @Render('modules/owner/managers/table')
  async managesTable(
    @Query('config') config: string = 'OrderByLatest',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
  ) {
    return {
      layout: false,
      // table: data
    }
  }
}