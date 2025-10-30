import { Module } from '@nestjs/common';
import { CustomerLedgerService } from './ledger.service';
import { CustomerLedgerController } from './ledger.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerLedgerController],
  providers: [CustomerLedgerService],
  exports: [CustomerLedgerService],
})
export class CustomerLedgerModule {}
