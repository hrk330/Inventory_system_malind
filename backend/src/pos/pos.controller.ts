import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PosService } from './pos.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { RefundSaleDto } from './dto/refund-sale.dto';
import { SaleFiltersDto } from './dto/sale-filters.dto';
import { UpdateSaleStatusDto } from './dto/update-sale-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('POS')
@Controller('pos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Post('sales')
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201, description: 'Sale created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Location or customer not found' })
  createSale(@Body() createSaleDto: CreateSaleDto, @Request() req) {
    return this.posService.createSale(createSaleDto, req.user.id);
  }

  @Get('sales')
  @ApiOperation({ summary: 'Get all sales with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Sales retrieved successfully' })
  getSales(@Query() filters: SaleFiltersDto) {
    return this.posService.getSales(filters);
  }

  @Get('sales-statistics')
  @ApiOperation({ summary: 'Get sales statistics with filters' })
  @ApiResponse({ status: 200, description: 'Sales statistics retrieved successfully' })
  getSalesStats(@Query() filters: SaleFiltersDto) {
    return this.posService.getSalesStats(filters);
  }

  @Get('sales/:id')
  @ApiOperation({ summary: 'Get sale details by ID' })
  @ApiResponse({ status: 200, description: 'Sale details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  getSaleById(@Param('id') id: string) {
    return this.posService.getSaleById(id);
  }

  @Patch('sales/:id/status')
  @ApiOperation({ summary: 'Update sale status' })
  @ApiResponse({ status: 200, description: 'Sale status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  updateSaleStatus(
    @Param('id') id: string,
    @Body() updateSaleStatusDto: UpdateSaleStatusDto,
    @Request() req,
  ) {
    return this.posService.updateSaleStatus(id, updateSaleStatusDto, req.user.id);
  }

  @Post('sales/:id/payments')
  @ApiOperation({ summary: 'Add payment to sale' })
  @ApiResponse({ status: 200, description: 'Payment added successfully' })
  @ApiResponse({ status: 400, description: 'Cannot add payment to this sale' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  addPayment(@Param('id') saleId: string, @Body() addPaymentDto: AddPaymentDto, @Request() req) {
    return this.posService.addPayment(saleId, addPaymentDto, req.user.id);
  }

  @Post('sales/:id/refund')
  @ApiOperation({ summary: 'Process refund for sale (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot refund this sale' })
  @ApiResponse({ status: 403, description: 'Only administrators can process refunds' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  processRefund(
    @Param('id') saleId: string,
    @Body() refundSaleDto: RefundSaleDto,
    @Request() req,
  ) {
    return this.posService.processRefund(saleId, refundSaleDto, req.user.id, req.user.role);
  }

  @Get('sales/daily-summary')
  @ApiOperation({ summary: 'Get daily sales summary' })
  @ApiQuery({ name: 'locationId', description: 'Filter by location', required: false })
  @ApiQuery({ name: 'date', description: 'Date (YYYY-MM-DD)', required: false })
  @ApiResponse({ status: 200, description: 'Daily summary retrieved successfully' })
  getDailySummary(@Query('locationId') locationId?: string, @Query('date') date?: string) {
    return this.posService.getDailySummary(locationId, date);
  }

  @Get('parked')
  @ApiOperation({ summary: 'Get parked (draft) sales for current user' })
  @ApiResponse({ status: 200, description: 'Parked sales retrieved successfully' })
  getParkedSales(@Request() req) {
    return this.posService.getParkedSales(req.user.id);
  }

  @Post('park/:id')
  @ApiOperation({ summary: 'Park a sale as draft' })
  @ApiResponse({ status: 200, description: 'Sale parked successfully' })
  @ApiResponse({ status: 400, description: 'Cannot park this sale' })
  @ApiResponse({ status: 403, description: 'You can only park your own sales' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  parkSale(@Param('id') saleId: string, @Request() req) {
    return this.posService.parkSale(saleId, req.user.id);
  }

  @Post('resume/:id')
  @ApiOperation({ summary: 'Resume a parked sale' })
  @ApiResponse({ status: 200, description: 'Sale resumed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot resume this sale' })
  @ApiResponse({ status: 403, description: 'You can only resume your own sales' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  resumeSale(@Param('id') saleId: string, @Request() req) {
    return this.posService.resumeSale(saleId, req.user.id);
  }

  @Get('reports/sales-by-user')
  @ApiOperation({ summary: 'Get sales report by user' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', required: false })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)', required: false })
  @ApiQuery({ name: 'locationId', description: 'Filter by location', required: false })
  @ApiResponse({ status: 200, description: 'Sales by user report retrieved successfully' })
  getSalesByUserReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('locationId') locationId?: string,
  ) {
    // This would be implemented in the service
    return { message: 'Sales by user report endpoint - to be implemented' };
  }

  @Get('reports/top-products')
  @ApiOperation({ summary: 'Get top selling products report' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', required: false })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)', required: false })
  @ApiQuery({ name: 'limit', description: 'Number of top products to return', required: false })
  @ApiResponse({ status: 200, description: 'Top products report retrieved successfully' })
  getTopProductsReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ) {
    // This would be implemented in the service
    return { message: 'Top products report endpoint - to be implemented' };
  }

  @Get('reports/hourly-sales')
  @ApiOperation({ summary: 'Get hourly sales breakdown' })
  @ApiQuery({ name: 'date', description: 'Date (YYYY-MM-DD)', required: false })
  @ApiQuery({ name: 'locationId', description: 'Filter by location', required: false })
  @ApiResponse({ status: 200, description: 'Hourly sales report retrieved successfully' })
  getHourlySalesReport(
    @Query('date') date?: string,
    @Query('locationId') locationId?: string,
  ) {
    // This would be implemented in the service
    return { message: 'Hourly sales report endpoint - to be implemented' };
  }
}
