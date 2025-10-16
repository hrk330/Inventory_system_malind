import { StockBalancesService } from './stock-balances.service';
export declare class StockBalancesController {
    private readonly stockBalancesService;
    constructor(stockBalancesService: StockBalancesService);
    findAll(productId?: string, locationId?: string): Promise<({
        product: {
            name: string;
            id: string;
            sku: string;
            reorderLevel: number;
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
        productId: string;
        locationId: string;
        quantity: number;
        lastUpdated: Date;
    })[]>;
    getReorderAlerts(): Promise<({
        product: {
            name: string;
            id: string;
            sku: string;
            reorderLevel: number;
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
        productId: string;
        locationId: string;
        quantity: number;
        lastUpdated: Date;
    })[]>;
    getTotalStock(productId: string): Promise<number>;
    getLocationStock(locationId: string): Promise<({
        product: {
            name: string;
            id: string;
            sku: string;
            reorderLevel: number;
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
        productId: string;
        locationId: string;
        quantity: number;
        lastUpdated: Date;
    })[]>;
}
