"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const products_module_1 = require("./products/products.module");
const locations_module_1 = require("./locations/locations.module");
const stock_balances_module_1 = require("./stock-balances/stock-balances.module");
const stock_transactions_module_1 = require("./stock-transactions/stock-transactions.module");
const stocktake_module_1 = require("./stocktake/stocktake.module");
const audit_module_1 = require("./audit/audit.module");
const csv_module_1 = require("./csv/csv.module");
const reorder_module_1 = require("./reorder/reorder.module");
const suppliers_module_1 = require("./suppliers/suppliers.module");
const product_variants_module_1 = require("./product-variants/product-variants.module");
const uoms_module_1 = require("./uoms/uoms.module");
const categories_module_1 = require("./categories/categories.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            locations_module_1.LocationsModule,
            stock_balances_module_1.StockBalancesModule,
            stock_transactions_module_1.StockTransactionsModule,
            stocktake_module_1.StocktakeModule,
            audit_module_1.AuditModule,
            csv_module_1.CsvModule,
            reorder_module_1.ReorderModule,
            suppliers_module_1.SuppliersModule,
            product_variants_module_1.ProductVariantsModule,
            uoms_module_1.UOMsModule,
            categories_module_1.CategoriesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map