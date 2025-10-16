import { ReorderService } from './reorder.service';
export declare class ReorderController {
    private readonly reorderService;
    constructor(reorderService: ReorderService);
    getAlerts(): Promise<({
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
    getSummary(): Promise<{
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
    getSuggestions(productId: string): Promise<{
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
}
