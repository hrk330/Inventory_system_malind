import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { CustomerLedgerService } from './ledger.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CustomerLedgerQueryDto } from './dto/ledger-query.dto';

@ApiTags('Customer Ledger')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomerLedgerController {
  constructor(private readonly ledgerService: CustomerLedgerService) {}

  @Get(':id/ledger')
  @ApiOperation({ summary: 'Get customer ledger with running balance' })
  @ApiResponse({ status: 200, description: 'Customer ledger retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  getCustomerLedger(@Param('id') id: string, @Query() queryDto: CustomerLedgerQueryDto) {
    return this.ledgerService.getCustomerLedger(id, queryDto);
  }

  @Get(':id/ledger/export/csv')
  @ApiOperation({ summary: 'Export customer ledger to CSV' })
  @ApiResponse({ status: 200, description: 'CSV export generated successfully' })
  async exportCsv(@Param('id') id: string, @Query() queryDto: CustomerLedgerQueryDto, @Res() res: Response) {
    const csvData = await this.ledgerService.exportToCsv(id, queryDto);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=customer-${id}-ledger.csv`);
    res.send(csvData);
  }

  @Get(':id/ledger/export/pdf')
  @ApiOperation({ summary: 'Export customer ledger to PDF' })
  @ApiResponse({ status: 200, description: 'PDF export generated successfully' })
  async exportPdf(@Param('id') id: string, @Query() queryDto: CustomerLedgerQueryDto, @Res() res: Response) {
    const pdfBuffer = await this.ledgerService.exportToPdf(id, queryDto);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=customer-${id}-ledger.pdf`);
    res.send(pdfBuffer);
  }
}
