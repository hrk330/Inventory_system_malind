import { PrismaService } from '../prisma/prisma.service';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
import { AuditService } from '../audit/audit.service';
export declare class StockTransactionsService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    create(createStockTransactionDto: CreateStockTransactionDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.TransactionType;
        productId: string;
        quantity: number;
        fromLocationId: string | null;
        toLocationId: string | null;
        referenceNo: string | null;
        remarks: string | null;
        createdBy: string;
    }>;
    findAll(productId?: string, locationId?: string, type?: string): Promise<({
        product: {
            id: string;
            name: string;
            sku: string;
            uom: {
                symbol: string;
            };
        };
        fromLocation: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.LocationType;
        };
        toLocation: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.LocationType;
        };
        creator: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.TransactionType;
        productId: string;
        quantity: number;
        fromLocationId: string | null;
        toLocationId: string | null;
        referenceNo: string | null;
        remarks: string | null;
        createdBy: string;
    })[]>;
    findOne(id: string): Promise<{
        product: {
            id: string;
            name: string;
            sku: string;
            uom: {
                symbol: string;
            };
        };
        fromLocation: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.LocationType;
        };
        toLocation: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.LocationType;
        };
        creator: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.TransactionType;
        productId: string;
        quantity: number;
        fromLocationId: string | null;
        toLocationId: string | null;
        referenceNo: string | null;
        remarks: string | null;
        createdBy: string;
    }>;
    private validateTransactionType;
    private getCurrentBalance;
    private updateStockBalances;
    private upsertStockBalance;
    private generateReferenceNumber;
}
