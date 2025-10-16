import { StockBalancesService } from './stock-balances.service';
export declare class StockBalancesController {
    private readonly stockBalancesService;
    constructor(stockBalancesService: StockBalancesService);
    findAll(productId?: string, locationId?: string): Promise<({
        product: {
            id: string;
            name: string;
            sku: string;
            reorderLevel: number;
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
        productId: string;
        locationId: string;
        quantity: number;
        lastUpdated: Date;
    })[]>;
    getReorderAlerts(): Promise<({
        product: {
            id: string;
            name: string;
            sku: string;
            reorderLevel: number;
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
        productId: string;
        locationId: string;
        quantity: number;
        lastUpdated: Date;
    })[]>;
    getTotalStock(productId: string): Promise<number>;
    getLocationStock(locationId: string): Promise<({
        product: {
            id: string;
            name: string;
            sku: string;
            reorderLevel: number;
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
        productId: string;
        locationId: string;
        quantity: number;
        lastUpdated: Date;
    })[]>;
}
