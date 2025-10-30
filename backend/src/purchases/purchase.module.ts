import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PurchaseSummaryController } from './summary.controller';
import { PurchaseSummaryService } from './summary.service';
import { PurchaseReportsController } from './reports.controller';
import { PurchaseReportsService } from './reports.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StockTransactionsModule } from '../stock-transactions/stock-transactions.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, StockTransactionsModule, AuditModule],
  controllers: [PurchaseController, PurchaseSummaryController, PurchaseReportsController],
  providers: [PurchaseService, PurchaseSummaryService, PurchaseReportsService],
  exports: [PurchaseService, PurchaseSummaryService, PurchaseReportsService],
})
export class PurchaseModule {}
