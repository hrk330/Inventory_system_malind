import { ImportStatus } from './bulk-import-record.dto';
export declare class CreateBulkImportRecordDto {
    fileName: string;
    originalFileName: string;
    status: ImportStatus;
    totalRecords: number;
    successfulRecords: number;
    failedRecords: number;
    errors?: string[];
    userId: string;
    summary?: {
        productsCreated: number;
        productsUpdated: number;
        categoriesCreated: number;
        uomsCreated: number;
    };
}
