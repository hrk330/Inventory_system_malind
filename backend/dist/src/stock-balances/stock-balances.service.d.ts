import { PrismaService } from '../prisma/prisma.service';
export declare class StockBalancesService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findOne(productId: string, locationId: string): Promise<{
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
    }>;
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
