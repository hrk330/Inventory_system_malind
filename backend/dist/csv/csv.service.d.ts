import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { LocationsService } from '../locations/locations.service';
import { CreateBulkImportRecordDto } from './dto/create-bulk-import-record.dto';
import { ImportStatus } from './dto/bulk-import-record.dto';
export declare class CsvService {
    private prisma;
    private productsService;
    private locationsService;
    private readonly logger;
    constructor(prisma: PrismaService, productsService: ProductsService, locationsService: LocationsService);
    exportProducts(): Promise<string>;
    exportStockBalances(): Promise<string>;
    exportStockTransactions(): Promise<string>;
    importProducts(file: Express.Multer.File): Promise<unknown>;
    createBulkImportRecord(createDto: CreateBulkImportRecordDto): Promise<{
        user: {
            name: string;
            email: string;
        };
    } & {
        summary: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        createdAt: Date;
        userId: string;
        fileName: string;
        originalFileName: string;
        status: string;
        totalRecords: number;
        successfulRecords: number;
        failedRecords: number;
        errors: string[];
        completedAt: Date | null;
    }>;
    updateBulkImportRecord(id: string, updateData: {
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
    }): Promise<{
        user: {
            name: string;
            email: string;
        };
    } & {
        summary: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        createdAt: Date;
        userId: string;
        fileName: string;
        originalFileName: string;
        status: string;
        totalRecords: number;
        successfulRecords: number;
        failedRecords: number;
        errors: string[];
        completedAt: Date | null;
    }>;
    getBulkImportHistory(): Promise<({
        user: {
            name: string;
            email: string;
        };
    } & {
        summary: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        createdAt: Date;
        userId: string;
        fileName: string;
        originalFileName: string;
        status: string;
        totalRecords: number;
        successfulRecords: number;
        failedRecords: number;
        errors: string[];
        completedAt: Date | null;
    })[]>;
    getBulkImportRecord(id: string): Promise<{
        user: {
            name: string;
            email: string;
        };
    } & {
        summary: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        createdAt: Date;
        userId: string;
        fileName: string;
        originalFileName: string;
        status: string;
        totalRecords: number;
        successfulRecords: number;
        failedRecords: number;
        errors: string[];
        completedAt: Date | null;
    }>;
    deleteBulkImportRecord(id: string): Promise<{
        message: string;
        id: string;
    }>;
}
