import { Module } from '@nestjs/common';
import { PosService } from './pos.service';
import { PosController } from './pos.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StockTransactionsModule } from '../stock-transactions/stock-transactions.module';
import { AuditModule } from '../audit/audit.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [PrismaModule, StockTransactionsModule, AuditModule, CustomersModule],
  controllers: [PosController],
  providers: [PosService],
  exports: [PosService],
})
export class PosModule {}
