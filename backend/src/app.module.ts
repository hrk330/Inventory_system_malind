import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { CustomersModule } from './customers/customers.module';
import { PosModule } from './pos/pos.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 100, // 100 requests per ttl
    }]),
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
    CustomersModule,
    PosModule,
    ReceiptsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
