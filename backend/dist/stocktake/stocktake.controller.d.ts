import { StocktakeService } from './stocktake.service';
import { CreateStocktakeDto } from './dto/create-stocktake.dto';
export declare class StocktakeController {
    private readonly stocktakeService;
    constructor(stocktakeService: StocktakeService);
    create(createStocktakeDto: CreateStocktakeDto, req: any): Promise<{
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
            name: string;
            id: string;
            sku: string;
            uom: {
                symbol: string;
            };
        };
        location: {
            type: import(".prisma/client").$Enums.LocationType;
            name: string;
            id: string;
        };
        performer: {
            name: string;
            email: string;
            id: string;
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
    getSummary(locationId?: string): Promise<{
        totalCount: number;
        adjustments: number;
        totalAdjustment: number;
        recentStocktakes: ({
            product: {
                name: string;
                id: string;
                sku: string;
                uom: {
                    symbol: string;
                };
            };
            location: {
                type: import(".prisma/client").$Enums.LocationType;
                name: string;
                id: string;
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
    findOne(id: string): Promise<{
        product: {
            name: string;
            id: string;
            sku: string;
            uom: {
                symbol: string;
            };
        };
        location: {
            type: import(".prisma/client").$Enums.LocationType;
            name: string;
            id: string;
        };
        performer: {
            name: string;
            email: string;
            id: string;
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
}
