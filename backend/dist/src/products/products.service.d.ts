import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuditService } from '../audit/audit.service';
export declare class ProductsService {
    private prisma;
    private auditService;
    private readonly logger;
    constructor(prisma: PrismaService, auditService: AuditService);
    create(createProductDto: CreateProductDto, userId?: string): Promise<{
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
    findBySku(sku: string): Promise<{
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
    update(id: string, updateProductDto: UpdateProductDto, userId?: string): Promise<{
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
    remove(id: string): Promise<{
        message: string;
    }>;
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
    restoreProduct(id: string): Promise<{
        message: string;
    }>;
    permanentDelete(id: string): Promise<{
        message: string;
    }>;
    bulkPermanentDelete(ids: string[]): Promise<{
        message: string;
        deletedCount: number;
    }>;
    downloadTemplate(): Promise<{
        filename: string;
        content: any;
        contentType: string;
    }>;
    previewBulkImport(file: Express.Multer.File): Promise<any[]>;
    bulkImport(file: Express.Multer.File, userId?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            imported: number;
            failed: number;
            errors: Array<{
                row: number;
                field: string;
                message: string;
            }>;
        };
    }>;
    private parseFile;
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
    createCategory(name: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        imageUrl: string | null;
    }>;
    updateCategory(oldName: string, newName: string): Promise<{
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
    bulkCreate(products: CreateProductDto[]): Promise<{
        count: number;
        message: string;
    }>;
    bulkUpdate(updates: {
        id: string;
        data: UpdateProductDto;
    }[]): Promise<{
        results: any[];
        successCount: number;
        totalCount: number;
    }>;
    bulkDelete(ids: string[]): Promise<{
        count: number;
        message: string;
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
    getProductPerformance(filters?: {
        category?: string;
        supplierId?: string;
    }): Promise<{
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
