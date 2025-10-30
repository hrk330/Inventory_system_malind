import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompaniesService } from './companies.service';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'List companies' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.companiesService.findAll({ page: Number(page) || 1, limit: Number(limit) || 10, search, isActive: isActive === undefined ? undefined : isActive === 'true' });
  }

  @Post()
  @ApiOperation({ summary: 'Create company' })
  create(@Body() body: { name: string; code?: string }) {
    return this.companiesService.create(body.name, body.code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company' })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update company' })
  update(@Param('id') id: string, @Body() body: { name?: string; code?: string; isActive?: boolean }) {
    return this.companiesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete company' })
  remove(@Param('id') id: string) {
    return this.companiesService.softDelete(id);
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'List products belonging to a company' })
  getProducts(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.companiesService.getProducts(id, { page: Number(page) || 1, limit: Number(limit) || 10, search });
  }
}


