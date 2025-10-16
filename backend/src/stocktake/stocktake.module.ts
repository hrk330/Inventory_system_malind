import { Module } from '@nestjs/common';
import { StocktakeService } from './stocktake.service';
import { StocktakeController } from './stocktake.controller';
import { StockTransactionsModule } from '../stock-transactions/stock-transactions.module';

@Module({
  imports: [StockTransactionsModule],
  providers: [StocktakeService],
  controllers: [StocktakeController],
  exports: [StocktakeService],
})
export class StocktakeModule {}
