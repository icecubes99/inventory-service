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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { User, Role } from '@prisma/client';
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

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Create a new user (ADMIN only)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER, Role.SITE_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Get all users (ADMIN, WAREHOUSE_MANAGER, SITE_MANAGER)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all users.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('paginated')
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER, Role.SITE_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary:
      'Get users with pagination and search (ADMIN, WAREHOUSE_MANAGER, SITE_MANAGER)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for username, name, or email',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: Role,
    description: 'Filter by user role',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by user status',
  })
  @ApiQuery({
    name: 'locationId',
    required: false,
    type: String,
    description: 'Filter by location ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Return paginated users with metadata.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              username: { type: 'string', example: 'john_doe' },
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john@example.com' },
              role: { type: 'string', example: 'PURCHASER' },
              status: { type: 'string', example: 'ACTIVE' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              locationId: { type: 'string', nullable: true },
              deletedAt: { type: 'string', nullable: true },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 10 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid query parameters.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAllPaginated(@Query() searchDto: SearchUsersDto) {
    return this.userService.findAllPaginated(searchDto);
  }

  @Get(':id')
  @Roles(
    Role.ADMIN,
    Role.WAREHOUSE_MANAGER,
    Role.SITE_MANAGER,
    Role.INVENTORY_MASTER,
    Role.PURCHASER,
    Role.FOREMAN,
    Role.ACCOUNTING,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get a user by id (ADMIN, managers, or self)' })
  @ApiParam({ name: 'id', type: 'string', description: 'UUID of the user' })
  @ApiResponse({
    status: 200,
    description: 'Return the user.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Get(':id/managed-locations')
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER, Role.SITE_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get locations managed by this user' })
  @ApiParam({ name: 'id', type: 'string', description: 'UUID of the user' })
  @ApiResponse({
    status: 200,
    description: 'Return the user with their managed locations.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getUserWithManagedLocations(@Param('id') id: string) {
    return this.userService.getUserWithManagedLocations(id);
  }

  @Patch(':id')
  @Roles(
    Role.ADMIN,
    Role.WAREHOUSE_MANAGER,
    Role.SITE_MANAGER,
    Role.INVENTORY_MASTER,
    Role.PURCHASER,
    Role.FOREMAN,
    Role.ACCOUNTING,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary:
      'Update a user (ADMIN can update anyone, others can update self only)',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'UUID of the user' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<User> {
    // The service will handle the permission checks for self vs admin updates
    return this.userService.update(id, updateUserDto, req.user.id);
  }

  @Delete(':id')
  @Roles(
    Role.ADMIN,
    Role.WAREHOUSE_MANAGER,
    Role.SITE_MANAGER,
    Role.INVENTORY_MASTER,
    Role.PURCHASER,
    Role.FOREMAN,
    Role.ACCOUNTING,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Delete a user (ADMIN can delete anyone, others can delete self only)',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'UUID of the user' })
  @ApiResponse({
    status: 204,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete user managing active locations.',
  })
  async remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.userService.remove(id, req.user.id);
  }
}
