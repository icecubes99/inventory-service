import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { LocationStatus, LocationType } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('locations')
// @ApiBearerAuth() // Added for Swagger to show auth requirement
// @UseGuards(AuthGuard('jwt'), RolesGuard) // Uncomment and adjust if you have these guards globally or locally
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  // @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  // @UseGuards(/** AuthGuard('jwt'), RolesGuard */) // Apply guards here or at controller level
  @ApiOperation({ summary: 'Create a new location (ADMIN, WAREHOUSE_MANAGER)' })
  @ApiBody({ type: CreateLocationDto })
  @ApiResponse({
    status: 201,
    description: 'The location has been successfully created.',
    // type: CreateLocationDto, // Type should be Location model ideally
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.create(createLocationDto);
  }

  @Get()
  // @Roles(
  //   Role.ADMIN,
  //   Role.WAREHOUSE_MANAGER,
  //   Role.INVENTORY_MASTER,
  //   Role.PURCHASER,
  //   Role.FOREMAN,
  // )
  // @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
  @ApiOperation({
    summary:
      'Get all locations (ADMIN, WAREHOUSE_MANAGER, INVENTORY_MASTER, PURCHASER, FOREMAN)',
  })
  @ApiResponse({ status: 200, description: 'Return all locations.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll() {
    return this.locationsService.findAll();
  }

  @Get('type/:type')
  // @Roles(
  //   Role.ADMIN,
  //   Role.WAREHOUSE_MANAGER,
  //   Role.INVENTORY_MASTER,
  //   Role.PURCHASER,
  //   Role.FOREMAN,
  // )
  // @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
  @ApiOperation({
    summary:
      'Get locations by type (ADMIN, WAREHOUSE_MANAGER, INVENTORY_MASTER, PURCHASER, FOREMAN)',
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
  // @Roles(
  //   Role.ADMIN,
  //   Role.WAREHOUSE_MANAGER,
  //   Role.INVENTORY_MASTER,
  //   Role.PURCHASER,
  //   Role.FOREMAN,
  // )
  // @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
  @ApiOperation({
    summary:
      'Get locations by status (ADMIN, WAREHOUSE_MANAGER, INVENTORY_MASTER, PURCHASER, FOREMAN)',
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
  // @Roles(
  //   Role.ADMIN,
  //   Role.WAREHOUSE_MANAGER,
  //   Role.INVENTORY_MASTER,
  //   Role.PURCHASER,
  //   Role.FOREMAN,
  // )
  // @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
  @ApiOperation({
    summary:
      'Get a location by ID (ADMIN, WAREHOUSE_MANAGER, INVENTORY_MASTER, PURCHASER, FOREMAN)',
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
  // @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  // @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
  @ApiOperation({ summary: 'Update a location (ADMIN, WAREHOUSE_MANAGER)' })
  @ApiParam({ name: 'id', type: 'string', description: 'UUID of the location' })
  @ApiBody({ type: UpdateLocationDto })
  @ApiResponse({
    status: 200,
    description: 'The location has been successfully updated.',
    // type: UpdateLocationDto, // Type should be Location model ideally
  })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationsService.update(id, updateLocationDto);
  }

  @Delete(':id')
  // @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  // @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
  @ApiOperation({
    summary: 'Delete a location (soft delete) (ADMIN, WAREHOUSE_MANAGER)',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'UUID of the location' })
  @ApiResponse({
    status: 200, // Should be 204 for No Content on successful delete
    description: 'The location has been successfully soft-deleted.',
  })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  remove(@Param('id') id: string) {
    return this.locationsService.remove(id);
  }

  @Post(':locationId/assign-user')
  // @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  // @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
  @ApiOperation({
    summary: 'Assign a user to a location (ADMIN, WAREHOUSE_MANAGER)',
  })
  @ApiParam({
    name: 'locationId',
    type: 'string',
    description: 'UUID of the location',
  })
  @ApiBody({ type: AssignUserDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully assigned to the location.',
  })
  @ApiResponse({ status: 404, description: 'Location or User not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  assignUser(
    @Param('locationId') locationId: string,
    @Body() assignUserDto: AssignUserDto,
  ) {
    return this.locationsService.assignUser(locationId, assignUserDto.userId);
  }

  @Post(':locationId/unassign-user')
  // @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  // @UseGuards(/** AuthGuard('jwt'), RolesGuard */)
  @ApiOperation({
    summary: 'Unassign a user from a location (ADMIN, WAREHOUSE_MANAGER)',
  })
  @ApiParam({
    name: 'locationId',
    type: 'string',
    description: 'UUID of the location',
  })
  @ApiBody({ type: AssignUserDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully unassigned from the location.',
  })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  unassignUser(
    @Param('locationId') locationId: string,
    @Body() assignUserDto: AssignUserDto,
  ) {
    return this.locationsService.unassignUser(locationId, assignUserDto.userId);
  }
}
