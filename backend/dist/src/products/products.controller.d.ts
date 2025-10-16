import { Response } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkCreateProductDto } from './dto/bulk-create-product.dto';
import { BulkUpdateProductDto } from './dto/bulk-update-product.dto';
import { BulkDeleteProductDto } from './dto/bulk-delete-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto, req: any): Promise<{
        uom: {
            symbol: string;
            id: string;
            name: string;
        };
        category: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        categoryId: string | null;
        uomId: string;
        reorderLevel: number;
        description: string | null;
        barcode: string | null;
        supplierId: string | null;
        supplierName: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        sellingPrice: import("@prisma/client/runtime/library").Decimal | null;
        minStock: number;
        maxStock: number | null;
        isActive: boolean;
        images: string[];
        deletedAt: Date | null;
    }>;
    findAll(search?: string, category?: string, status?: string): Promise<({
        stockBalances: {
            location: {
                name: string;
            };
            quantity: number;
        }[];
        uom: {
            symbol: string;
            id: string;
            name: string;
        };
        category: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        categoryId: string | null;
        uomId: string;
        reorderLevel: number;
        description: string | null;
        barcode: string | null;
        supplierId: string | null;
        supplierName: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        sellingPrice: import("@prisma/client/runtime/library").Decimal | null;
        minStock: number;
        maxStock: number | null;
        isActive: boolean;
        images: string[];
        deletedAt: Date | null;
    })[]>;
    getCategories(): Promise<({
        _count: {
            products: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        imageUrl: string | null;
    })[]>;
    createCategory(body: {
        name: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        imageUrl: string | null;
    }>;
    updateCategory(oldName: string, body: {
        newName: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        imageUrl: string | null;
    }>;
    deleteCategory(name: string): Promise<{
        message: string;
        category: string;
    }>;
    getUOMs(): Promise<{
        id: string;
        name: string;
        symbol: string;
        description: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        productCount: number;
    }[]>;
    getDeletedProducts(): Promise<({
        uom: {
            symbol: string;
            id: string;
            name: string;
        };
        category: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        categoryId: string | null;
        uomId: string;
        reorderLevel: number;
        description: string | null;
        barcode: string | null;
        supplierId: string | null;
        supplierName: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        sellingPrice: import("@prisma/client/runtime/library").Decimal | null;
        minStock: number;
        maxStock: number | null;
        isActive: boolean;
        images: string[];
        deletedAt: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        uom: {
            symbol: string;
            id: string;
            name: string;
        };
        category: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        categoryId: string | null;
        uomId: string;
        reorderLevel: number;
        description: string | null;
        barcode: string | null;
        supplierId: string | null;
        supplierName: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        sellingPrice: import("@prisma/client/runtime/library").Decimal | null;
        minStock: number;
        maxStock: number | null;
        isActive: boolean;
        images: string[];
        deletedAt: Date | null;
    }>;
    update(id: string, updateProductDto: UpdateProductDto, req: any): Promise<{
        stockBalances: {
            location: {
                name: string;
            };
            quantity: number;
        }[];
        uom: {
            symbol: string;
            id: string;
            name: string;
        };
        category: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        categoryId: string | null;
        uomId: string;
        reorderLevel: number;
        description: string | null;
        barcode: string | null;
        supplierId: string | null;
        supplierName: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        sellingPrice: import("@prisma/client/runtime/library").Decimal | null;
        minStock: number;
        maxStock: number | null;
        isActive: boolean;
        images: string[];
        deletedAt: Date | null;
    }>;
    bulkDelete(bulkDeleteDto: BulkDeleteProductDto): Promise<{
        count: number;
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    restoreProduct(id: string): Promise<{
        message: string;
    }>;
    bulkPermanentDelete(body: {
        ids: string[];
    }): Promise<{
        message: string;
        deletedCount: number;
    }>;
    permanentDelete(id: string): Promise<{
        message: string;
    }>;
    downloadTemplate(res: Response): Promise<void>;
    previewBulkImport(file: Express.Multer.File): Promise<any[]>;
    bulkImport(file: Express.Multer.File, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            imported: number;
            failed: number;
            errors: {
                row: number;
                field: string;
                message: string;
            }[];
        };
    }>;
    findByBarcode(barcode: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        categoryId: string | null;
        uomId: string;
        reorderLevel: number;
        description: string | null;
        barcode: string | null;
        supplierId: string | null;
        supplierName: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        sellingPrice: import("@prisma/client/runtime/library").Decimal | null;
        minStock: number;
        maxStock: number | null;
        isActive: boolean;
        images: string[];
        deletedAt: Date | null;
    }>;
    bulkCreate(bulkCreateDto: BulkCreateProductDto): Promise<{
        count: number;
        message: string;
    }>;
    bulkUpdate(bulkUpdateDto: BulkUpdateProductDto): Promise<{
        results: any[];
        successCount: number;
        totalCount: number;
    }>;
    toggleActive(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        categoryId: string | null;
        uomId: string;
        reorderLevel: number;
        description: string | null;
        barcode: string | null;
        supplierId: string | null;
        supplierName: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        sellingPrice: import("@prisma/client/runtime/library").Decimal | null;
        minStock: number;
        maxStock: number | null;
        isActive: boolean;
        images: string[];
        deletedAt: Date | null;
    }>;
    getPerformance(category?: string, supplierId?: string): Promise<{
        totalProducts: number;
        activeProducts: number;
        inactiveProducts: number;
        lowStockProducts: number;
        outOfStockProducts: number;
        categoryDistribution: {
            categoryId: string;
            count: number;
        }[];
        supplierDistribution: {
            supplierId: string;
            count: number;
        }[];
    }>;
}
