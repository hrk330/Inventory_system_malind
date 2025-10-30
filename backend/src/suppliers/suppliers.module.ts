import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { SupplierLedgerController } from './ledger.controller';
import { SupplierLedgerService } from './ledger.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SuppliersController, SupplierLedgerController],
  providers: [SuppliersService, SupplierLedgerService],
  exports: [SuppliersService, SupplierLedgerService],
})
export class SuppliersModule {}
