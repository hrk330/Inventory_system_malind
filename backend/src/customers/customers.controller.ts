import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerFiltersDto } from './dto/customer-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Customer with this email already exists' })
  create(@Body() createCustomerDto: CreateCustomerDto, @Request() req) {
    return this.customersService.create(createCustomerDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  findAll(@Query() filters: CustomerFiltersDto) {
    return this.customersService.findAll(filters);
  }

  @Get('search')
  @ApiOperation({ summary: 'Quick search customers by name, email, phone, or customer number' })
  @ApiQuery({ name: 'q', description: 'Search query', example: 'John' })
  @ApiResponse({ status: 200, description: 'Search results' })
  search(@Query('q') query: string) {
    return this.customersService.searchCustomers(query);
  }

  @Get('ledger-overview')
  @ApiOperation({ summary: 'Get all customers with their ledger summaries' })
  @ApiQuery({ name: 'search', description: 'Search customers by name, email, or phone', required: false })
  @ApiResponse({ status: 200, description: 'Customer ledger overview retrieved successfully' })
  getLedgerOverview(@Query('search') search?: string) {
    return this.customersService.getLedgerOverview(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID with purchase history' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Get(':id/sales')
  @ApiOperation({ summary: 'Get customer purchase history' })
  @ApiResponse({ status: 200, description: 'Purchase history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  getCustomerSales(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get customer statistics' })
  @ApiResponse({ status: 200, description: 'Customer statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  getCustomerStats(@Param('id') id: string) {
    return this.customersService.getCustomerStats(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer information' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Customer with this email already exists' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @Request() req) {
    return this.customersService.update(id, updateCustomerDto, req.user.id);
  }

  @Patch(':id/loyalty-points')
  @ApiOperation({ summary: 'Update customer loyalty points' })
  @ApiResponse({ status: 200, description: 'Loyalty points updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  updateLoyaltyPoints(
    @Param('id') id: string,
    @Body() body: { points: number; action: 'ADD' | 'SUBTRACT' },
    @Request() req
  ) {
    return this.customersService.updateLoyaltyPoints(id, body.points, body.action, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete customer (set inactive)' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  delete(@Param('id') id: string, @Request() req) {
    return this.customersService.delete(id, req.user.id);
  }
}
