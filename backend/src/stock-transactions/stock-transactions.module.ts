import { Module } from '@nestjs/common';
import { StockTransactionsService } from './stock-transactions.service';
import { StockTransactionsController } from './stock-transactions.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [StockTransactionsService],
  controllers: [StockTransactionsController],
  exports: [StockTransactionsService],
})
export class StockTransactionsModule {}
