"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvModule = void 0;
const common_1 = require("@nestjs/common");
const csv_service_1 = require("./csv.service");
const csv_controller_1 = require("./csv.controller");
const products_module_1 = require("../products/products.module");
const locations_module_1 = require("../locations/locations.module");
let CsvModule = class CsvModule {
};
exports.CsvModule = CsvModule;
exports.CsvModule = CsvModule = __decorate([
    (0, common_1.Module)({
        imports: [products_module_1.ProductsModule, locations_module_1.LocationsModule],
        providers: [csv_service_1.CsvService],
        controllers: [csv_controller_1.CsvController],
        exports: [csv_service_1.CsvService],
    })
], CsvModule);
//# sourceMappingURL=csv.module.js.map