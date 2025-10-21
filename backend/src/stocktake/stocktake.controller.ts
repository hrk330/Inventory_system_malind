import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StocktakeService } from './stocktake.service';
import { CreateStocktakeDto } from './dto/create-stocktake.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Stocktake')
@Controller('stocktake')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StocktakeController {
  constructor(private readonly stocktakeService: StocktakeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new stocktake' })
  @ApiResponse({ status: 201, description: 'Stocktake created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product or location not found' })
  async create(@Body() createStocktakeDto: CreateStocktakeDto, @Request() req) {
    try {
      console.log('Stocktake request received:', createStocktakeDto);
      console.log('User ID:', req.user.id);
      console.log('Data types:', {
        productId: typeof createStocktakeDto.productId,
        locationId: typeof createStocktakeDto.locationId,
        countedQuantity: typeof createStocktakeDto.countedQuantity,
        remarks: typeof createStocktakeDto.remarks
      });
      
      const result = await this.stocktakeService.create(createStocktakeDto, req.user.id);
      console.log('Stocktake created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error in stocktake controller:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all stocktakes' })
  @ApiResponse({ status: 200, description: 'Stocktakes retrieved successfully' })
  @ApiQuery({ name: 'productId', required: false, description: 'Filter by product ID' })
  @ApiQuery({ name: 'locationId', required: false, description: 'Filter by location ID' })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('productId') productId?: string,
    @Query('locationId') locationId?: string,
  ) {
    return this.stocktakeService.findAll(paginationDto, productId, locationId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get stocktake summary' })
  @ApiResponse({ status: 200, description: 'Summary retrieved successfully' })
  @ApiQuery({ name: 'locationId', required: false, description: 'Filter by location ID' })
  getSummary(@Query('locationId') locationId?: string) {
    return this.stocktakeService.getStocktakeSummary(locationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stocktake by ID' })
  @ApiResponse({ status: 200, description: 'Stocktake retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Stocktake not found' })
  findOne(@Param('id') id: string) {
    return this.stocktakeService.findOne(id);
  }
}
