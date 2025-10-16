export declare enum ImportStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare class BulkImportRecordDto {
    id: string;
    fileName: string;
    originalFileName: string;
    status: ImportStatus;
    totalRecords: number;
    successfulRecords: number;
    failedRecords: number;
    errors?: string[];
    createdAt: string;
    completedAt?: string;
    userId: string;
    userName: string;
    userEmail: string;
    summary?: {
        productsCreated: number;
        productsUpdated: number;
        categoriesCreated: number;
        uomsCreated: number;
    };
}
