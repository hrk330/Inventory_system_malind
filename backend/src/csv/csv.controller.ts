import { Controller, Get, Post, UseInterceptors, UploadedFile, UseGuards, Res, Param, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { CsvService } from './csv.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';
import * as fs from 'fs';

@ApiTags('CSV Import/Export')
@Controller('csv')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  @Get('export/products')
  @ApiOperation({ summary: 'Export products to CSV' })
  @ApiResponse({ status: 200, description: 'Products exported successfully' })
  async exportProducts(@Res() res: Response) {
    const filePath = await this.csvService.exportProducts();
    const file = fs.readFileSync(filePath);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.send(file);
    
    // Clean up temp file
    fs.unlinkSync(filePath);
  }

  @Get('export/stock-balances')
  @ApiOperation({ summary: 'Export stock balances to CSV' })
  @ApiResponse({ status: 200, description: 'Stock balances exported successfully' })
  async exportStockBalances(@Res() res: Response) {
    const filePath = await this.csvService.exportStockBalances();
    const file = fs.readFileSync(filePath);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=stock-balances.csv');
    res.send(file);
    
    // Clean up temp file
    fs.unlinkSync(filePath);
  }

  @Get('export/stock-transactions')
  @ApiOperation({ summary: 'Export stock transactions to CSV' })
  @ApiResponse({ status: 200, description: 'Stock transactions exported successfully' })
  async exportStockTransactions(@Res() res: Response) {
    const filePath = await this.csvService.exportStockTransactions();
    const file = fs.readFileSync(filePath);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=stock-transactions.csv');
    res.send(file);
    
    // Clean up temp file
    fs.unlinkSync(filePath);
  }

  @Post('import/products')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import products from CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Products imported successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async importProducts(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    return this.csvService.importProducts(file);
  }

  // Bulk Import History Endpoints
  @Get('bulk-import-history')
  @ApiOperation({ summary: 'Get bulk import history' })
  @ApiResponse({ status: 200, description: 'Bulk import history retrieved successfully' })
  async getBulkImportHistory() {
    return this.csvService.getBulkImportHistory();
  }

  @Get('bulk-import-history/:id')
  @ApiOperation({ summary: 'Get specific bulk import record' })
  @ApiResponse({ status: 200, description: 'Bulk import record retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Bulk import record not found' })
  async getBulkImportRecord(@Param('id') id: string) {
    return this.csvService.getBulkImportRecord(id);
  }

  @Delete('bulk-import-history/:id')
  @ApiOperation({ summary: 'Delete bulk import record' })
  @ApiResponse({ status: 200, description: 'Bulk import record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bulk import record not found' })
  async deleteBulkImportRecord(@Param('id') id: string) {
    return this.csvService.deleteBulkImportRecord(id);
  }
}
