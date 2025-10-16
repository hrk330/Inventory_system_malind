import { PrismaService } from '../prisma/prisma.service';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
import { AuditService } from '../audit/audit.service';
export declare class StockTransactionsService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    create(createStockTransactionDto: CreateStockTransactionDto, userId: string): Promise<{
        type: import(".prisma/client").$Enums.TransactionType;
        id: string;
        createdAt: Date;
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
            name: string;
            id: string;
            sku: string;
            uom: {
                symbol: string;
            };
        };
        fromLocation: {
            type: import(".prisma/client").$Enums.LocationType;
            name: string;
            id: string;
        };
        toLocation: {
            type: import(".prisma/client").$Enums.LocationType;
            name: string;
            id: string;
        };
        creator: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        type: import(".prisma/client").$Enums.TransactionType;
        id: string;
        createdAt: Date;
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
            name: string;
            id: string;
            sku: string;
            uom: {
                symbol: string;
            };
        };
        fromLocation: {
            type: import(".prisma/client").$Enums.LocationType;
            name: string;
            id: string;
        };
        toLocation: {
            type: import(".prisma/client").$Enums.LocationType;
            name: string;
            id: string;
        };
        creator: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        type: import(".prisma/client").$Enums.TransactionType;
        id: string;
        createdAt: Date;
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
