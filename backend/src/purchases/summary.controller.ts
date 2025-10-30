import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PurchaseSummaryService } from './summary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SummaryQueryDto } from './dto/summary-query.dto';

@ApiTags('Purchase Summary')
@Controller('purchases/summary')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PurchaseSummaryController {
  constructor(private readonly summaryService: PurchaseSummaryService) {}

  @Get()
  @ApiOperation({ summary: 'Get purchase summary and analytics' })
  @ApiResponse({ status: 200, description: 'Purchase summary retrieved successfully' })
  getSummary(@Query() queryDto: SummaryQueryDto) {
    return this.summaryService.getSummary(queryDto);
  }

  @Get('monthly-trends')
  @ApiOperation({ summary: 'Get monthly purchase trends' })
  @ApiResponse({ status: 200, description: 'Monthly trends retrieved successfully' })
  getMonthlyTrends(@Query() queryDto: SummaryQueryDto) {
    return this.summaryService.getMonthlyTrends(queryDto);
  }

  @Get('top-suppliers')
  @ApiOperation({ summary: 'Get top suppliers by purchase value' })
  @ApiResponse({ status: 200, description: 'Top suppliers retrieved successfully' })
  getTopSuppliers(@Query() queryDto: SummaryQueryDto) {
    return this.summaryService.getTopSuppliers(queryDto);
  }
}
