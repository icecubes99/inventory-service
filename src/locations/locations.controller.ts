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
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { SearchLocationsDto } from './dto/search-locations.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { SetManagerDto } from './dto/set-manager.dto';
import { LocationStatus, LocationType, Role } from '@prisma/client';
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
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('locations')
@ApiBearerAuth()
@Controller('locations')
export class LocationsController {
  constructor(
    private readonly locationsService: LocationsService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Create a new location (ADMIN, WAREHOUSE_MANAGER)' })
  @ApiBody({ type: CreateLocationDto })
  @ApiResponse({
    status: 201,
    description: 'The location has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(
    @Body() createLocationDto: CreateLocationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.locationsService.create(createLocationDto, req.user.id);
  }

  @Get()
  @Roles(
    Role.ADMIN,
    Role.WAREHOUSE_MANAGER,
    Role.INVENTORY_MASTER,
    Role.PURCHASER,
    Role.FOREMAN,
    Role.SITE_MANAGER,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary:
      'Get all locations (ADMIN, WAREHOUSE_MANAGER, INVENTORY_MASTER, PURCHASER, FOREMAN, SITE_MANAGER)',
  })
  @ApiResponse({ status: 200, description: 'Return all locations.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll() {
    return this.locationsService.findAll();
  }

  @Get('paginated')
  @Roles(
    Role.ADMIN,
    Role.WAREHOUSE_MANAGER,
    Role.INVENTORY_MASTER,
    Role.PURCHASER,
    Role.FOREMAN,
    Role.SITE_MANAGER,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary:
      'Get locations with pagination and search (ADMIN, WAREHOUSE_MANAGER, INVENTORY_MASTER, PURCHASER, FOREMAN, SITE_MANAGER)',
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
    description: 'Search term for location name',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: LocationType,
    description: 'Filter by location type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: LocationStatus,
    description: 'Filter by location status',
  })
  @ApiQuery({
    name: 'managerId',
    required: false,
    type: String,
    description: 'Filter by manager ID',
  })
  @ApiQuery({
    name: 'hasManager',
    required: false,
    type: Boolean,
    description: 'Filter locations with/without manager',
  })
  @ApiResponse({
    status: 200,
    description: 'Return paginated locations with metadata.',
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
              name: { type: 'string', example: 'Central Warehouse Manila' },
              type: { type: 'string', example: 'WAREHOUSE' },
              status: { type: 'string', example: 'ACTIVE' },
              managerId: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              deletedAt: { type: 'string', nullable: true },
              manager: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                },
              },
              assignedUsers: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    username: { type: 'string' },
                    email: { type: 'string' },
                  },
                },
              },
              _count: {
                type: 'object',
                properties: {
                  inventory: { type: 'number' },
                  MrfsFrom: { type: 'number' },
                  DeliveriesTo: { type: 'number' },
                  DeliveriesFrom: { type: 'number' },
                },
              },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 6 },
            totalPages: { type: 'number', example: 1 },
            hasNextPage: { type: 'boolean', example: false },
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
  findAllPaginated(@Query() searchDto: SearchLocationsDto) {
    return this.locationsService.findAllPaginated(searchDto);
  }

  @Get('type/:type')
  @Roles(
    Role.ADMIN,
    Role.WAREHOUSE_MANAGER,
    Role.INVENTORY_MASTER,
    Role.PURCHASER,
    Role.FOREMAN,
    Role.SITE_MANAGER,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary:
      'Get locations by type (ADMIN, WAREHOUSE_MANAGER, INVENTORY_MASTER, PURCHASER, FOREMAN, SITE_MANAGER)',
  })
  @ApiParam({
    name: 'type',
    enum: LocationType,
    description: 'Type of the location',
  })
  @ApiResponse({
    status: 200,
    description: 'Return locations matching the type.',
  })
  @ApiResponse({
    status: 404,
    description: 'No locations found for this type.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByType(@Param('type') type: LocationType) {
    return this.locationsService.findByType(type);
  }

  @Get('status/:status')
  @Roles(
    Role.ADMIN,
    Role.WAREHOUSE_MANAGER,
    Role.INVENTORY_MASTER,
    Role.PURCHASER,
    Role.FOREMAN,
    Role.SITE_MANAGER,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary:
      'Get locations by status (ADMIN, WAREHOUSE_MANAGER, INVENTORY_MASTER, PURCHASER, FOREMAN, SITE_MANAGER)',
  })
  @ApiParam({
    name: 'status',
    enum: LocationStatus,
    description: 'Status of the location',
  })
  @ApiResponse({
    status: 200,
    description: 'Return locations matching the status.',
  })
  @ApiResponse({
    status: 404,
    description: 'No locations found for this status.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByStatus(@Param('status') status: LocationStatus) {
    return this.locationsService.findByStatus(status);
  }

  @Get(':id')
  @Roles(
    Role.ADMIN,
    Role.WAREHOUSE_MANAGER,
    Role.INVENTORY_MASTER,
    Role.PURCHASER,
    Role.FOREMAN,
    Role.SITE_MANAGER,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary:
      'Get a location by ID (ADMIN, WAREHOUSE_MANAGER, INVENTORY_MASTER, PURCHASER, FOREMAN, SITE_MANAGER)',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'UUID of the location' })
  @ApiResponse({ status: 200, description: 'Return the location.' })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER, Role.SITE_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary:
      'Update a location (ADMIN, WAREHOUSE_MANAGER, or manager of this specific location)',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'UUID of the location' })
  @ApiBody({ type: UpdateLocationDto })
  @ApiResponse({
    status: 200,
    description: 'The location has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.locationsService.update(id, updateLocationDto, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a location (soft delete) (ADMIN, WAREHOUSE_MANAGER)',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'UUID of the location' })
  @ApiResponse({
    status: 204,
    description: 'The location has been successfully soft-deleted.',
  })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    await this.locationsService.remove(id, req.user.id);
    return;
  }

  @Post(':id/set-manager')
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER, Role.SITE_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Set or change the manager of a location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiBody({ type: SetManagerDto })
  setManager(
    @Param('id') locationId: string,
    @Body() setManagerDto: SetManagerDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.userService.assignManagerToLocation(
      locationId,
      setManagerDto.managerUserId,
      req.user.id,
    );
  }

  @Post(':id/remove-manager')
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER, Role.SITE_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Remove the manager from a location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @HttpCode(HttpStatus.OK)
  async removeManager(
    @Param('id') locationId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.userService.removeManagerFromLocation(locationId, req.user.id);
  }

  @Post(':locationId/assign-user')
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER, Role.SITE_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Assign a regular user to a location (not as manager)',
  })
  @ApiParam({ name: 'locationId', type: 'string' })
  assignUser(
    @Param('locationId') locationId: string,
    @Body() assignUserDto: AssignUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.locationsService.assignUser(
      locationId,
      assignUserDto.userId,
      req.user.id,
    );
  }

  @Post(':locationId/unassign-user')
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER, Role.SITE_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Unassign a regular user from a location' })
  @ApiParam({ name: 'locationId', type: 'string' })
  unassignUser(
    @Param('locationId') locationId: string,
    @Body() assignUserDto: AssignUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.locationsService.unassignUser(
      locationId,
      assignUserDto.userId,
      req.user.id,
    );
  }
}
