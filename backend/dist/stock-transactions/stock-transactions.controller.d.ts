import { StockTransactionsService } from './stock-transactions.service';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
export declare class StockTransactionsController {
    private readonly stockTransactionsService;
    constructor(stockTransactionsService: StockTransactionsService);
    create(createStockTransactionDto: CreateStockTransactionDto, req: any): Promise<{
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
}
