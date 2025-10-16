import { Module } from '@nestjs/common';
import { StockBalancesService } from './stock-balances.service';
import { StockBalancesController } from './stock-balances.controller';

@Module({
  providers: [StockBalancesService],
  controllers: [StockBalancesController],
  exports: [StockBalancesService],
})
export class StockBalancesModule {}
