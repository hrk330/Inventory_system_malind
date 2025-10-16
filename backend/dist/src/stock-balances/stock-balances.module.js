"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockBalancesModule = void 0;
const common_1 = require("@nestjs/common");
const stock_balances_service_1 = require("./stock-balances.service");
const stock_balances_controller_1 = require("./stock-balances.controller");
let StockBalancesModule = class StockBalancesModule {
};
exports.StockBalancesModule = StockBalancesModule;
exports.StockBalancesModule = StockBalancesModule = __decorate([
    (0, common_1.Module)({
        providers: [stock_balances_service_1.StockBalancesService],
        controllers: [stock_balances_controller_1.StockBalancesController],
        exports: [stock_balances_service_1.StockBalancesService],
    })
], StockBalancesModule);
//# sourceMappingURL=stock-balances.module.js.map