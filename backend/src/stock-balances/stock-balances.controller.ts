import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StockBalancesService } from './stock-balances.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Stock Balances')
@Controller('stock/balances')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StockBalancesController {
  constructor(private readonly stockBalancesService: StockBalancesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stock balances' })
  @ApiResponse({ status: 200, description: 'Stock balances retrieved successfully' })
  @ApiQuery({ name: 'productId', required: false, description: 'Filter by product ID' })
  @ApiQuery({ name: 'locationId', required: false, description: 'Filter by location ID' })
  findAll(@Query('productId') productId?: string, @Query('locationId') locationId?: string) {
    return this.stockBalancesService.findAll(productId, locationId);
  }

  @Get('reorder-alerts')
  @ApiOperation({ summary: 'Get reorder alerts' })
  @ApiResponse({ status: 200, description: 'Reorder alerts retrieved successfully' })
  getReorderAlerts() {
    return this.stockBalancesService.getReorderAlerts();
  }

  @Get('total/:productId')
  @ApiOperation({ summary: 'Get total stock for a product across all locations' })
  @ApiResponse({ status: 200, description: 'Total stock retrieved successfully' })
  getTotalStock(@Query('productId') productId: string) {
    return this.stockBalancesService.getTotalStock(productId);
  }

  @Get('location/:locationId')
  @ApiOperation({ summary: 'Get stock for a specific location' })
  @ApiResponse({ status: 200, description: 'Location stock retrieved successfully' })
  getLocationStock(@Param('locationId') locationId: string) {
    return this.stockBalancesService.getLocationStock(locationId);
  }
}
