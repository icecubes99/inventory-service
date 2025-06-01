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
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
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
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UserService } from '../user/user.service';
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
  @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
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
  @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
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

  @Get('type/:type')
  @Roles(
    Role.ADMIN,
    Role.WAREHOUSE_MANAGER,
    Role.INVENTORY_MASTER,
    Role.PURCHASER,
    Role.FOREMAN,
    Role.SITE_MANAGER,
  )
  @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
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
  @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
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
  @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
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
  @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
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
  @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
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
  @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
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
  @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
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
  @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
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
  @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
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
