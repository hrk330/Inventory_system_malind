import { PrismaService } from '../prisma/prisma.service';
export declare class StockBalancesService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findOne(productId: string, locationId: string): Promise<{
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
    }>;
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
