import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
export declare class ProductVariantsController {
    private readonly productVariantsService;
    constructor(productVariantsService: ProductVariantsService);
    create(productId: string, createVariantDto: CreateProductVariantDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        barcode: string | null;
        isActive: boolean;
        productId: string;
        variantName: string;
        variantValue: string;
        additionalPrice: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    findAll(productId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        barcode: string | null;
        isActive: boolean;
        productId: string;
        variantName: string;
        variantValue: string;
        additionalPrice: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    findOne(id: string): Promise<{
        product: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            categoryId: string | null;
            uomId: string;
            reorderLevel: number;
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        barcode: string | null;
        isActive: boolean;
        productId: string;
        variantName: string;
        variantValue: string;
        additionalPrice: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    update(id: string, updateVariantDto: UpdateProductVariantDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        barcode: string | null;
        isActive: boolean;
        productId: string;
        variantName: string;
        variantValue: string;
        additionalPrice: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        barcode: string | null;
        isActive: boolean;
        productId: string;
        variantName: string;
        variantValue: string;
        additionalPrice: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
