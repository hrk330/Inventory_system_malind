export declare class CreateProductDto {
    name: string;
    sku: string;
    categoryId?: string;
    uomId: string;
    reorderLevel: number;
    description?: string;
    barcode?: string;
    supplierId?: string;
    supplierName?: string;
    costPrice?: number;
    sellingPrice?: number;
    minStock: number;
    maxStock?: number;
    isActive: boolean;
    images?: string[];
}
