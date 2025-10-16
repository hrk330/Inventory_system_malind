import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { LocationsModule } from './locations/locations.module';
import { StockBalancesModule } from './stock-balances/stock-balances.module';
import { StockTransactionsModule } from './stock-transactions/stock-transactions.module';
import { StocktakeModule } from './stocktake/stocktake.module';
import { AuditModule } from './audit/audit.module';
import { CsvModule } from './csv/csv.module';
import { ReorderModule } from './reorder/reorder.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ProductVariantsModule } from './product-variants/product-variants.module';
import { UOMsModule } from './uoms/uoms.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    LocationsModule,
    StockBalancesModule,
    StockTransactionsModule,
    StocktakeModule,
    AuditModule,
    CsvModule,
    ReorderModule,
    SuppliersModule,
    ProductVariantsModule,
    UOMsModule,
    CategoriesModule,
  ],
})
export class AppModule {}
