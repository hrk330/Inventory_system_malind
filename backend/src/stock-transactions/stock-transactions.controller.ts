import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StockTransactionsService } from './stock-transactions.service';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Stock Transactions')
@Controller('stock/transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StockTransactionsController {
  constructor(private readonly stockTransactionsService: StockTransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new stock transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product or location not found' })
  create(@Body() createStockTransactionDto: CreateStockTransactionDto, @Request() req) {
    return this.stockTransactionsService.create(createStockTransactionDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stock transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  @ApiQuery({ name: 'productId', required: false, description: 'Filter by product ID' })
  @ApiQuery({ name: 'locationId', required: false, description: 'Filter by location ID' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by transaction type' })
  findAll(
    @Query('productId') productId?: string,
    @Query('locationId') locationId?: string,
    @Query('type') type?: string,
  ) {
    return this.stockTransactionsService.findAll(productId, locationId, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  findOne(@Param('id') id: string) {
    return this.stockTransactionsService.findOne(id);
  }
}
