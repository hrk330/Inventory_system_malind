import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UOMsService } from './uoms.service';
import { CreateUOMDto } from './dto/create-uom.dto';
import { UpdateUOMDto } from './dto/update-uom.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('UOMs')
@Controller('uoms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UOMsController {
  constructor(private readonly uomsService: UOMsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new UOM' })
  @ApiResponse({ status: 201, description: 'UOM created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'UOM with this symbol already exists' })
  create(@Body() createUOMDto: CreateUOMDto) {
    return this.uomsService.create(createUOMDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all UOMs' })
  @ApiResponse({ status: 200, description: 'UOMs retrieved successfully' })
  findAll() {
    return this.uomsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get UOM by ID' })
  @ApiResponse({ status: 200, description: 'UOM retrieved successfully' })
  @ApiResponse({ status: 404, description: 'UOM not found' })
  findOne(@Param('id') id: string) {
    return this.uomsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update UOM' })
  @ApiResponse({ status: 200, description: 'UOM updated successfully' })
  @ApiResponse({ status: 404, description: 'UOM not found' })
  @ApiResponse({ status: 409, description: 'UOM with this symbol already exists' })
  update(@Param('id') id: string, @Body() updateUOMDto: UpdateUOMDto) {
    return this.uomsService.update(id, updateUOMDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete UOM' })
  @ApiResponse({ status: 200, description: 'UOM deleted successfully' })
  @ApiResponse({ status: 404, description: 'UOM not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete UOM that is being used by products' })
  remove(@Param('id') id: string) {
    return this.uomsService.remove(id);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk delete UOMs' })
  @ApiResponse({ status: 200, description: 'UOMs deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Some UOMs cannot be deleted' })
  bulkDelete(@Body() bulkDeleteDto: { ids: string[] }) {
    return this.uomsService.bulkDelete(bulkDeleteDto.ids);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle UOM active status' })
  @ApiResponse({ status: 200, description: 'UOM status toggled successfully' })
  @ApiResponse({ status: 404, description: 'UOM not found' })
  toggleActive(@Param('id') id: string) {
    return this.uomsService.toggleActive(id);
  }
}
