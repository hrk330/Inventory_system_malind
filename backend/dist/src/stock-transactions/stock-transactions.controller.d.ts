import { StockTransactionsService } from './stock-transactions.service';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
export declare class StockTransactionsController {
    private readonly stockTransactionsService;
    constructor(stockTransactionsService: StockTransactionsService);
    create(createStockTransactionDto: CreateStockTransactionDto, req: any): Promise<{
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
}
