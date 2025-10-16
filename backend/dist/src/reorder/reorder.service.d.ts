import { PrismaService } from '../prisma/prisma.service';
export declare class ReorderService {
    private prisma;
    constructor(prisma: PrismaService);
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
    getReorderSummary(): Promise<{
        totalAlerts: number;
        criticalAlerts: number;
        lowStockAlerts: number;
        alertsByLocation: {
            location: string;
            count: any;
            alerts: any;
        }[];
        alertsByProduct: {
            product: string;
            count: any;
            alerts: any;
        }[];
    }>;
    getReorderSuggestions(productId: string): Promise<{
        product: {
            id: string;
            name: string;
            sku: string;
            unit: string;
            reorderLevel: number;
        };
        currentStock: number;
        suggestedReorder: number;
        stockByLocation: {
            location: {
                id: string;
                name: string;
                type: import(".prisma/client").$Enums.LocationType;
            };
            quantity: number;
            status: string;
        }[];
    }>;
    private groupByLocation;
    private groupByProduct;
}
