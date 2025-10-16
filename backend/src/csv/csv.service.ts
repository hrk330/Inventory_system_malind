import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { LocationsService } from '../locations/locations.service';
import csv from 'csv-parser';
import * as createCsvWriter from 'csv-writer';
import { Readable } from 'stream';
import { CreateBulkImportRecordDto } from './dto/create-bulk-import-record.dto';
import { ImportStatus } from './dto/bulk-import-record.dto';

@Injectable()
export class CsvService {
  private readonly logger = new Logger(CsvService.name);

  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
    private locationsService: LocationsService,
  ) {}

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

  async importProducts(file: Express.Multer.File) {
    const results = [];
    const errors = [];

    return new Promise((resolve, reject) => {
      const stream = Readable.from(file.buffer.toString());
      
      stream
        .pipe(csv())
        .on('data', async (row) => {
          try {
            const productData = {
              name: row.Name || row.name,
              sku: row.SKU || row.sku,
              category: row.Category || row.category || null,
              uomId: 'uom-pcs', // Default to pieces UOM
              reorderLevel: parseFloat(row['Reorder Level'] || row.reorderLevel || '0'),
              minStock: 0,
              isActive: true,
            };

            // Validate required fields
            if (!productData.name || !productData.sku) {
              errors.push({ row, error: 'Name and SKU are required' });
              return;
            }

            // Check if product already exists
            const existingProduct = await this.productsService.findBySku(productData.sku);
            if (existingProduct) {
              errors.push({ row, error: 'Product with this SKU already exists' });
              return;
            }

            const product = await this.productsService.create(productData);
            results.push(product);
          } catch (error) {
            errors.push({ row, error: error.message });
          }
        })
        .on('end', () => {
          resolve({ results, errors });
        })
        .on('error', reject);
    });
  }

  // Bulk Import History Methods
  async createBulkImportRecord(createDto: CreateBulkImportRecordDto) {
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

  async updateBulkImportRecord(id: string, updateData: {
    status?: ImportStatus;
    successfulRecords?: number;
    failedRecords?: number;
    errors?: string[];
    completedAt?: Date;
    summary?: {
      productsCreated: number;
      productsUpdated: number;
      categoriesCreated: number;
      uomsCreated: number;
    };
  }) {
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

  async getBulkImportRecord(id: string) {
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

  async deleteBulkImportRecord(id: string) {
    this.logger.log(`Deleting bulk import record: ${id}`);
    
    await this.prisma.bulkImportRecord.delete({
      where: { id }
    });

    this.logger.log(`Bulk import record deleted: ${id}`);
    return { message: 'Bulk import record deleted successfully', id };
  }
}
