import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemStatus, Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('items')
@ApiBearerAuth()
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER, Role.INVENTORY_MASTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Create a new item (ADMIN, WAREHOUSE_MANAGER, INVENTORY_MASTER)',
  })
  @ApiBody({ type: CreateItemDto })
  @ApiResponse({
    status: 201,
    description: 'The item has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Item code already exists.' })
  create(
    @Body() createItemDto: CreateItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.itemsService.create(createItemDto, req.user.id);
  }

  @Get()
  @Roles(
    Role.ADMIN,
    Role.WAREHOUSE_MANAGER,
    Role.INVENTORY_MASTER,
    Role.PURCHASER,
    Role.FOREMAN,
    Role.SITE_MANAGER,
    Role.ACCOUNTING,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Get all items (all authenticated users)',
  })
  @ApiResponse({ status: 200, description: 'Return all items.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll() {
    return this.itemsService.findAll();
  }

  @Get('search')
  @Roles(
    Role.ADMIN,
    Role.WAREHOUSE_MANAGER,
    Role.INVENTORY_MASTER,
    Role.PURCHASER,
    Role.FOREMAN,
    Role.SITE_MANAGER,
    Role.ACCOUNTING,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Search items by code or description (all authenticated users)',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query for item code or description',
    example: 'steel',
  })
  @ApiResponse({
    status: 200,
    description: 'Return items matching the search query.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  search(@Query('q') query: string) {
    return this.itemsService.search(query);
  }

  @Get('status/:status')
  @Roles(
    Role.ADMIN,
    Role.WAREHOUSE_MANAGER,
    Role.INVENTORY_MASTER,
    Role.PURCHASER,
    Role.FOREMAN,
    Role.SITE_MANAGER,
    Role.ACCOUNTING,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Get items by status (all authenticated users)',
  })
  @ApiParam({
    name: 'status',
    enum: ItemStatus,
    description: 'Status of the item',
  })
  @ApiResponse({
    status: 200,
    description: 'Return items matching the status.',
  })
  @ApiResponse({
    status: 404,
    description: 'No items found for this status.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByStatus(@Param('status') status: ItemStatus) {
    return this.itemsService.findByStatus(status);
  }

  @Get('code/:code')
  @Roles(
    Role.ADMIN,
    Role.WAREHOUSE_MANAGER,
    Role.INVENTORY_MASTER,
    Role.PURCHASER,
    Role.FOREMAN,
    Role.SITE_MANAGER,
    Role.ACCOUNTING,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Get an item by code (all authenticated users)',
  })
  @ApiParam({ name: 'code', type: 'string', description: 'Code of the item' })
  @ApiResponse({ status: 200, description: 'Return the item.' })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByCode(@Param('code') code: string) {
    return this.itemsService.findByCode(code);
  }

  @Get(':id')
  @Roles(
    Role.ADMIN,
    Role.WAREHOUSE_MANAGER,
    Role.INVENTORY_MASTER,
    Role.PURCHASER,
    Role.FOREMAN,
    Role.SITE_MANAGER,
    Role.ACCOUNTING,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Get an item by ID (all authenticated users)',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'UUID of the item' })
  @ApiResponse({ status: 200, description: 'Return the item.' })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER, Role.INVENTORY_MASTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Update an item (ADMIN, WAREHOUSE_MANAGER, INVENTORY_MASTER)',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'UUID of the item' })
  @ApiBody({ type: UpdateItemDto })
  @ApiResponse({
    status: 200,
    description: 'The item has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Item code already exists.' })
  update(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.itemsService.update(id, updateItemDto, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete an item (soft delete) (ADMIN, WAREHOUSE_MANAGER)',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'UUID of the item' })
  @ApiResponse({
    status: 204,
    description: 'The item has been successfully soft-deleted.',
  })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete item that is being used.',
  })
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    await this.itemsService.remove(id, req.user.id);
    return;
  }
}
