import { PrismaService } from '../prisma/prisma.service';
import { StockTransactionsService } from '../stock-transactions/stock-transactions.service';
import { CreateStocktakeDto } from './dto/create-stocktake.dto';
export declare class StocktakeService {
    private prisma;
    private stockTransactionsService;
    constructor(prisma: PrismaService, stockTransactionsService: StockTransactionsService);
    create(createStocktakeDto: CreateStocktakeDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        productId: string;
        locationId: string;
        countedQuantity: number;
        systemQuantity: number;
        adjustment: number;
        performedBy: string;
    }>;
    findAll(productId?: string, locationId?: string): Promise<({
        product: {
            id: string;
            name: string;
            sku: string;
            uom: {
                symbol: string;
            };
        };
        location: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.LocationType;
        };
        performer: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        productId: string;
        locationId: string;
        countedQuantity: number;
        systemQuantity: number;
        adjustment: number;
        performedBy: string;
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
        location: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.LocationType;
        };
        performer: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        productId: string;
        locationId: string;
        countedQuantity: number;
        systemQuantity: number;
        adjustment: number;
        performedBy: string;
    }>;
    getStocktakeSummary(locationId?: string): Promise<{
        totalCount: number;
        adjustments: number;
        totalAdjustment: number;
        recentStocktakes: ({
            product: {
                id: string;
                name: string;
                sku: string;
                uom: {
                    symbol: string;
                };
            };
            location: {
                id: string;
                name: string;
                type: import(".prisma/client").$Enums.LocationType;
            };
        } & {
            id: string;
            createdAt: Date;
            productId: string;
            locationId: string;
            countedQuantity: number;
            systemQuantity: number;
            adjustment: number;
            performedBy: string;
        })[];
    }>;
}
