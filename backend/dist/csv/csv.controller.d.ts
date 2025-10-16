import { CsvService } from './csv.service';
import { Response } from 'express';
export declare class CsvController {
    private readonly csvService;
    constructor(csvService: CsvService);
    exportProducts(res: Response): Promise<void>;
    exportStockBalances(res: Response): Promise<void>;
    exportStockTransactions(res: Response): Promise<void>;
    importProducts(file: Express.Multer.File): Promise<unknown>;
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
