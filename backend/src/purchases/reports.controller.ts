import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { PurchaseReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsQueryDto } from './dto/reports-query.dto';

@ApiTags('Purchase Reports')
@Controller('purchases/reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PurchaseReportsController {
  constructor(private readonly reportsService: PurchaseReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get comprehensive purchase reports' })
  @ApiResponse({ status: 200, description: 'Purchase reports retrieved successfully' })
  getReports(@Query() queryDto: ReportsQueryDto) {
    return this.reportsService.getReports(queryDto);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export purchase reports to CSV' })
  @ApiResponse({ status: 200, description: 'CSV export generated successfully' })
  async exportCsv(@Query() queryDto: ReportsQueryDto, @Res() res: Response) {
    const csvData = await this.reportsService.exportToCsv(queryDto);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=purchase-reports.csv');
    res.send(csvData);
  }

  @Get('export/pdf')
  @ApiOperation({ summary: 'Export purchase reports to PDF' })
  @ApiResponse({ status: 200, description: 'PDF export generated successfully' })
  async exportPdf(@Query() queryDto: ReportsQueryDto, @Res() res: Response) {
    const pdfBuffer = await this.reportsService.exportToPdf(queryDto);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=purchase-reports.pdf');
    res.send(pdfBuffer);
  }

  @Get('monthly-comparison')
  @ApiOperation({ summary: 'Get monthly purchase vs return comparison' })
  @ApiResponse({ status: 200, description: 'Monthly comparison retrieved successfully' })
  getMonthlyComparison(@Query() queryDto: ReportsQueryDto) {
    return this.reportsService.getMonthlyComparison(queryDto);
  }

  @Get('product-analysis')
  @ApiOperation({ summary: 'Get top purchased products analysis' })
  @ApiResponse({ status: 200, description: 'Product analysis retrieved successfully' })
  getProductAnalysis(@Query() queryDto: ReportsQueryDto) {
    return this.reportsService.getProductAnalysis(queryDto);
  }
}
