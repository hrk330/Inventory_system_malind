import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { SupplierLedgerService } from './ledger.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LedgerQueryDto } from './dto/ledger-query.dto';

@ApiTags('Supplier Ledger')
@Controller('suppliers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupplierLedgerController {
  constructor(private readonly ledgerService: SupplierLedgerService) {}

  @Get(':id/ledger')
  @ApiOperation({ summary: 'Get supplier ledger with running balance' })
  @ApiResponse({ status: 200, description: 'Supplier ledger retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  getSupplierLedger(@Param('id') id: string, @Query() queryDto: LedgerQueryDto) {
    return this.ledgerService.getSupplierLedger(id, queryDto);
  }

  @Get(':id/ledger/export/csv')
  @ApiOperation({ summary: 'Export supplier ledger to CSV' })
  @ApiResponse({ status: 200, description: 'CSV export generated successfully' })
  async exportCsv(@Param('id') id: string, @Query() queryDto: LedgerQueryDto, @Res() res: Response) {
    const csvData = await this.ledgerService.exportToCsv(id, queryDto);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=supplier-${id}-ledger.csv`);
    res.send(csvData);
  }

  @Get(':id/ledger/export/pdf')
  @ApiOperation({ summary: 'Export supplier ledger to PDF' })
  @ApiResponse({ status: 200, description: 'PDF export generated successfully' })
  async exportPdf(@Param('id') id: string, @Query() queryDto: LedgerQueryDto, @Res() res: Response) {
    const pdfBuffer = await this.ledgerService.exportToPdf(id, queryDto);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=supplier-${id}-ledger.pdf`);
    res.send(pdfBuffer);
  }
}
