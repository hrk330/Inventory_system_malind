import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { LocationsQueryDto } from './dto/locations-query.dto';

@ApiTags('Locations')
@Controller('locations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({ status: 201, description: 'Location created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Location with this name already exists' })
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.create(createLocationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({ status: 200, description: 'Locations retrieved successfully' })
  findAll(@Query() queryDto: LocationsQueryDto) {
    const { page, limit, search, type } = queryDto;
    const paginationDto = { page, limit };
    return this.locationsService.findAll(paginationDto, search, type);
  }

  @Get('pos')
  @ApiOperation({ summary: 'Get locations optimized for POS' })
  @ApiResponse({ status: 200, description: 'Locations retrieved successfully for POS' })
  findAllForPOS() {
    return this.locationsService.findAllForPOS();
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all location types' })
  @ApiResponse({ status: 200, description: 'Types retrieved successfully' })
  getTypes() {
    return this.locationsService.getTypes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiResponse({ status: 200, description: 'Location retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update location' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({ status: 409, description: 'Location with this name already exists' })
  update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.locationsService.update(id, updateLocationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete location' })
  @ApiResponse({ status: 200, description: 'Location deleted successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete location with existing stock' })
  remove(@Param('id') id: string) {
    return this.locationsService.remove(id);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk delete locations' })
  @ApiResponse({ status: 200, description: 'Locations deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Some locations cannot be deleted' })
  bulkDelete(@Body() bulkDeleteDto: { ids: string[] }) {
    return this.locationsService.bulkDelete(bulkDeleteDto.ids);
  }
}
