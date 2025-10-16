"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CsvService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const products_service_1 = require("../products/products.service");
const locations_service_1 = require("../locations/locations.service");
const csv_parser_1 = __importDefault(require("csv-parser"));
const createCsvWriter = __importStar(require("csv-writer"));
const stream_1 = require("stream");
let CsvService = CsvService_1 = class CsvService {
    constructor(prisma, productsService, locationsService) {
        this.prisma = prisma;
        this.productsService = productsService;
        this.locationsService = locationsService;
        this.logger = new common_1.Logger(CsvService_1.name);
    }
    async exportProducts() {
        const products = await this.prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
        });
        const csvWriter = createCsvWriter.createObjectCsvWriter({
            path: 'temp/products.csv',
            header: [
                { id: 'name', title: 'Name' },
                { id: 'sku', title: 'SKU' },
                { id: 'category', title: 'Category' },
                { id: 'unit', title: 'Unit' },
                { id: 'reorderLevel', title: 'Reorder Level' },
                { id: 'createdAt', title: 'Created At' },
            ],
        });
        await csvWriter.writeRecords(products);
        return 'temp/products.csv';
    }
    async exportStockBalances() {
        const balances = await this.prisma.stockBalance.findMany({
            include: {
                product: {
                    select: {
                        name: true,
                        sku: true,
                        uom: {
                            select: {
                                symbol: true
                            }
                        },
                    },
                },
                location: {
                    select: {
                        name: true,
                        type: true,
                    },
                },
            },
            orderBy: [
                { product: { name: 'asc' } },
                { location: { name: 'asc' } },
            ],
        });
        const csvWriter = createCsvWriter.createObjectCsvWriter({
            path: 'temp/stock-balances.csv',
            header: [
                { id: 'productName', title: 'Product Name' },
                { id: 'productSku', title: 'Product SKU' },
                { id: 'productUnit', title: 'Unit' },
                { id: 'locationName', title: 'Location Name' },
                { id: 'locationType', title: 'Location Type' },
                { id: 'quantity', title: 'Quantity' },
                { id: 'lastUpdated', title: 'Last Updated' },
            ],
        });
        const records = balances.map(balance => ({
            productName: balance.product.name,
            productSku: balance.product.sku,
            productUnit: balance.product.uom.symbol,
            locationName: balance.location.name,
            locationType: balance.location.type,
            quantity: balance.quantity,
            lastUpdated: balance.lastUpdated,
        }));
        await csvWriter.writeRecords(records);
        return 'temp/stock-balances.csv';
    }
    async exportStockTransactions() {
        const transactions = await this.prisma.stockTransaction.findMany({
            include: {
                product: {
                    select: {
                        name: true,
                        sku: true,
                        uom: {
                            select: {
                                symbol: true
                            }
                        },
                    },
                },
                fromLocation: {
                    select: {
                        name: true,
                        type: true,
                    },
                },
                toLocation: {
                    select: {
                        name: true,
                        type: true,
                    },
                },
                creator: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const csvWriter = createCsvWriter.createObjectCsvWriter({
            path: 'temp/stock-transactions.csv',
            header: [
                { id: 'productName', title: 'Product Name' },
                { id: 'productSku', title: 'Product SKU' },
                { id: 'productUnit', title: 'Unit' },
                { id: 'type', title: 'Transaction Type' },
                { id: 'quantity', title: 'Quantity' },
                { id: 'fromLocation', title: 'From Location' },
                { id: 'toLocation', title: 'To Location' },
                { id: 'referenceNo', title: 'Reference No' },
                { id: 'remarks', title: 'Remarks' },
                { id: 'createdBy', title: 'Created By' },
                { id: 'createdAt', title: 'Created At' },
            ],
        });
        const records = transactions.map(transaction => ({
            productName: transaction.product.name,
            productSku: transaction.product.sku,
            productUnit: transaction.product.uom.symbol,
            type: transaction.type,
            quantity: transaction.quantity,
            fromLocation: transaction.fromLocation?.name || '',
            toLocation: transaction.toLocation?.name || '',
            referenceNo: transaction.referenceNo || '',
            remarks: transaction.remarks || '',
            createdBy: transaction.creator.name,
            createdAt: transaction.createdAt,
        }));
        await csvWriter.writeRecords(records);
        return 'temp/stock-transactions.csv';
    }
    async importProducts(file) {
        const results = [];
        const errors = [];
        return new Promise((resolve, reject) => {
            const stream = stream_1.Readable.from(file.buffer.toString());
            stream
                .pipe((0, csv_parser_1.default)())
                .on('data', async (row) => {
                try {
                    const productData = {
                        name: row.Name || row.name,
                        sku: row.SKU || row.sku,
                        category: row.Category || row.category || null,
                        uomId: 'uom-pcs',
                        reorderLevel: parseFloat(row['Reorder Level'] || row.reorderLevel || '0'),
                        minStock: 0,
                        isActive: true,
                    };
                    if (!productData.name || !productData.sku) {
                        errors.push({ row, error: 'Name and SKU are required' });
                        return;
                    }
                    const existingProduct = await this.productsService.findBySku(productData.sku);
                    if (existingProduct) {
                        errors.push({ row, error: 'Product with this SKU already exists' });
                        return;
                    }
                    const product = await this.productsService.create(productData);
                    results.push(product);
                }
                catch (error) {
                    errors.push({ row, error: error.message });
                }
            })
                .on('end', () => {
                resolve({ results, errors });
            })
                .on('error', reject);
        });
    }
    async createBulkImportRecord(createDto) {
        this.logger.log(`Creating bulk import record for file: ${createDto.fileName}`);
        const record = await this.prisma.bulkImportRecord.create({
            data: {
                fileName: createDto.fileName,
                originalFileName: createDto.originalFileName,
                status: createDto.status,
                totalRecords: createDto.totalRecords,
                successfulRecords: createDto.successfulRecords,
                failedRecords: createDto.failedRecords,
                errors: createDto.errors || [],
                userId: createDto.userId,
                summary: createDto.summary || {
                    productsCreated: 0,
                    productsUpdated: 0,
                    categoriesCreated: 0,
                    uomsCreated: 0
                }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        this.logger.log(`Bulk import record created with ID: ${record.id}`);
        return record;
    }
    async updateBulkImportRecord(id, updateData) {
        this.logger.log(`Updating bulk import record: ${id}`);
        const record = await this.prisma.bulkImportRecord.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        this.logger.log(`Bulk import record updated: ${id}`);
        return record;
    }
    async getBulkImportHistory() {
        this.logger.log('Fetching bulk import history');
        const records = await this.prisma.bulkImportRecord.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        this.logger.log(`Found ${records.length} bulk import records`);
        return records;
    }
    async getBulkImportRecord(id) {
        this.logger.log(`Fetching bulk import record: ${id}`);
        const record = await this.prisma.bulkImportRecord.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        if (!record) {
            this.logger.warn(`Bulk import record not found: ${id}`);
            return null;
        }
        this.logger.log(`Bulk import record found: ${id}`);
        return record;
    }
    async deleteBulkImportRecord(id) {
        this.logger.log(`Deleting bulk import record: ${id}`);
        await this.prisma.bulkImportRecord.delete({
            where: { id }
        });
        this.logger.log(`Bulk import record deleted: ${id}`);
        return { message: 'Bulk import record deleted successfully', id };
    }
};
exports.CsvService = CsvService;
exports.CsvService = CsvService = CsvService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        products_service_1.ProductsService,
        locations_service_1.LocationsService])
], CsvService);
//# sourceMappingURL=csv.service.js.map