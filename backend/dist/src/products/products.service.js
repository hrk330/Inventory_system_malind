"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let ProductsService = ProductsService_1 = class ProductsService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.logger = new common_1.Logger(ProductsService_1.name);
    }
    async create(createProductDto, userId) {
        this.logger.log(`Creating product: ${createProductDto.name} (SKU: ${createProductDto.sku})`);
        const existingProduct = await this.prisma.product.findUnique({
            where: { sku: createProductDto.sku },
        });
        if (existingProduct) {
            this.logger.warn(`SKU conflict: ${createProductDto.sku} already exists`);
            throw new common_1.ConflictException('Product with this SKU already exists');
        }
        const uom = await this.prisma.uOM.findUnique({
            where: { id: createProductDto.uomId },
        });
        if (!uom) {
            this.logger.warn(`UOM not found: ${createProductDto.uomId}`);
            throw new common_1.BadRequestException('Invalid UOM ID provided');
        }
        if (createProductDto.supplierId) {
            const supplier = await this.prisma.supplier.findUnique({
                where: { id: createProductDto.supplierId },
            });
            if (!supplier) {
                this.logger.warn(`Supplier not found: ${createProductDto.supplierId}`);
                throw new common_1.BadRequestException('Invalid supplier ID provided');
            }
        }
        if (createProductDto.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: createProductDto.categoryId },
            });
            if (!category) {
                this.logger.warn(`Category not found: ${createProductDto.categoryId}`);
                throw new common_1.BadRequestException('Invalid category ID provided');
            }
        }
        if (createProductDto.barcode && createProductDto.barcode.trim() !== '') {
            const existingProduct = await this.prisma.product.findFirst({
                where: { barcode: createProductDto.barcode },
            });
            if (existingProduct) {
                this.logger.warn(`Barcode already exists: ${createProductDto.barcode}`);
                throw new common_1.ConflictException('A product with this barcode already exists');
            }
        }
        const productData = {
            name: createProductDto.name,
            sku: createProductDto.sku,
            categoryId: createProductDto.categoryId || null,
            uomId: createProductDto.uomId,
            reorderLevel: createProductDto.reorderLevel,
            description: createProductDto.description || null,
            barcode: createProductDto.barcode && createProductDto.barcode.trim() !== '' ? createProductDto.barcode : null,
            supplierId: createProductDto.supplierId || null,
            supplierName: createProductDto.supplierName || null,
            costPrice: createProductDto.costPrice || null,
            sellingPrice: createProductDto.sellingPrice || null,
            minStock: createProductDto.minStock,
            maxStock: createProductDto.maxStock || null,
            isActive: createProductDto.isActive,
            images: createProductDto.images || [],
        };
        const product = await this.prisma.product.create({
            data: productData,
            include: {
                uom: {
                    select: {
                        id: true,
                        name: true,
                        symbol: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        this.logger.log(`Product created successfully: ${product.id}`);
        if (userId) {
            try {
                await this.auditService.log(userId, 'Product', product.id, 'CREATE', null, {
                    name: product.name,
                    sku: product.sku,
                    categoryId: product.categoryId,
                    uomId: product.uomId,
                    supplierId: product.supplierId,
                    costPrice: product.costPrice,
                    sellingPrice: product.sellingPrice,
                    reorderLevel: product.reorderLevel,
                    minStock: product.minStock,
                    maxStock: product.maxStock,
                });
            }
            catch (auditError) {
                this.logger.warn(`Failed to log audit trail for product creation: ${auditError.message}`);
            }
        }
        return product;
    }
    async findAll(search, category, status) {
        this.logger.log(`Fetching products - search: ${search || 'none'}, category: ${category || 'all'}, status: ${status || 'all'}`);
        const where = {
            deletedAt: null,
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (category) {
            if (typeof category === 'string' && !category.includes('-')) {
                const categoryRecord = await this.prisma.category.findFirst({
                    where: {
                        name: {
                            equals: category,
                            mode: 'insensitive'
                        }
                    },
                    select: { id: true }
                });
                if (categoryRecord) {
                    where.categoryId = categoryRecord.id;
                }
                else {
                    where.categoryId = 'non-existent-id';
                }
            }
            else {
                where.categoryId = category;
            }
        }
        if (status === 'active') {
            where.isActive = true;
        }
        else if (status === 'inactive') {
            where.isActive = false;
        }
        const products = await this.prisma.product.findMany({
            where,
            include: {
                uom: {
                    select: {
                        id: true,
                        name: true,
                        symbol: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                stockBalances: {
                    select: {
                        quantity: true,
                        location: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        this.logger.log(`Found ${products.length} products`);
        return products;
    }
    async findOne(id) {
        this.logger.log(`Fetching product: ${id}`);
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                uom: {
                    select: {
                        id: true,
                        name: true,
                        symbol: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        if (!product) {
            this.logger.warn(`Product not found: ${id}`);
            throw new common_1.NotFoundException('Product not found');
        }
        this.logger.log(`Product found: ${product.name}`);
        return product;
    }
    async findBySku(sku) {
        return this.prisma.product.findUnique({
            where: { sku },
        });
    }
    async update(id, updateProductDto, userId) {
        this.logger.log(`Updating product: ${id}`);
        this.logger.log(`Received update data: ${JSON.stringify(updateProductDto, null, 2)}`);
        try {
            const existingProduct = await this.findOne(id);
            if (updateProductDto.sku) {
                this.logger.log(`Checking SKU conflict for: ${updateProductDto.sku}`);
                const skuConflict = await this.prisma.product.findFirst({
                    where: {
                        sku: updateProductDto.sku,
                        id: { not: id }
                    },
                });
                if (skuConflict) {
                    this.logger.warn(`SKU conflict: ${updateProductDto.sku} already exists`);
                    throw new common_1.ConflictException('Product with this SKU already exists');
                }
            }
            if (updateProductDto.barcode && updateProductDto.barcode.trim() !== '') {
                this.logger.log(`Checking barcode conflict for: ${updateProductDto.barcode}`);
                const barcodeConflict = await this.prisma.product.findFirst({
                    where: {
                        barcode: updateProductDto.barcode,
                        id: { not: id }
                    },
                });
                if (barcodeConflict) {
                    this.logger.warn(`Barcode conflict: ${updateProductDto.barcode} already exists`);
                    throw new common_1.ConflictException('A product with this barcode already exists');
                }
            }
            if (updateProductDto.categoryId) {
                const category = await this.prisma.category.findUnique({
                    where: { id: updateProductDto.categoryId },
                });
                if (!category) {
                    this.logger.warn(`Category not found: ${updateProductDto.categoryId}`);
                    throw new common_1.BadRequestException('Invalid category ID provided');
                }
            }
            const { uomId, supplierId, categoryId, ...updateData } = updateProductDto;
            const updatePayload = { ...updateData };
            if (updatePayload.barcode !== undefined) {
                updatePayload.barcode = updatePayload.barcode && updatePayload.barcode.trim() !== '' ? updatePayload.barcode : null;
            }
            if (uomId) {
                updatePayload.uom = {
                    connect: { id: uomId }
                };
            }
            if (supplierId) {
                updatePayload.supplier = {
                    connect: { id: supplierId }
                };
            }
            else if (supplierId === null || supplierId === '') {
                updatePayload.supplier = {
                    disconnect: true
                };
            }
            if (categoryId) {
                updatePayload.category = {
                    connect: { id: categoryId }
                };
            }
            else if (categoryId === null || categoryId === '') {
                updatePayload.category = {
                    disconnect: true
                };
            }
            const updatedProduct = await this.prisma.product.update({
                where: { id },
                data: updatePayload,
                include: {
                    uom: {
                        select: {
                            id: true,
                            name: true,
                            symbol: true
                        }
                    },
                    category: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    stockBalances: {
                        select: {
                            quantity: true,
                            location: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            });
            const finalProduct = await this.prisma.product.findUnique({
                where: { id },
                include: {
                    uom: {
                        select: {
                            id: true,
                            name: true,
                            symbol: true
                        }
                    },
                    category: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    stockBalances: {
                        select: {
                            quantity: true,
                            location: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            });
            this.logger.log(`Product updated successfully: ${updatedProduct.id}`);
            this.logger.log(`Final product stock balances: ${JSON.stringify(finalProduct?.stockBalances)}`);
            if (userId) {
                try {
                    await this.auditService.log(userId, 'Product', id, 'UPDATE', {
                        name: existingProduct.name,
                        sku: existingProduct.sku,
                        categoryId: existingProduct.categoryId,
                        uomId: existingProduct.uomId,
                        supplierId: existingProduct.supplierId,
                        costPrice: existingProduct.costPrice,
                        sellingPrice: existingProduct.sellingPrice,
                        reorderLevel: existingProduct.reorderLevel,
                        minStock: existingProduct.minStock,
                        maxStock: existingProduct.maxStock,
                    }, {
                        name: finalProduct.name,
                        sku: finalProduct.sku,
                        categoryId: finalProduct.categoryId,
                        uomId: finalProduct.uomId,
                        supplierId: finalProduct.supplierId,
                        costPrice: finalProduct.costPrice,
                        sellingPrice: finalProduct.sellingPrice,
                        reorderLevel: finalProduct.reorderLevel,
                        minStock: finalProduct.minStock,
                        maxStock: finalProduct.maxStock,
                    });
                }
                catch (auditError) {
                    this.logger.warn(`Failed to log audit trail for product update: ${auditError.message}`);
                }
            }
            return finalProduct;
        }
        catch (error) {
            this.logger.error(`Error updating product ${id}:`, error);
            throw error;
        }
    }
    async remove(id) {
        this.logger.log(`Soft deleting product: ${id}`);
        const product = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.deletedAt) {
            throw new common_1.ConflictException('Product is already deleted');
        }
        const stockBalances = await this.prisma.stockBalance.findMany({
            where: { productId: id },
        });
        if (stockBalances.length > 0) {
            this.logger.warn(`Cannot delete product ${id}: has existing stock balances`);
            throw new common_1.ConflictException('Cannot delete product with existing stock balances');
        }
        await this.prisma.product.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false
            },
        });
        this.logger.log(`Product soft deleted successfully: ${id}`);
        return { message: 'Product deleted successfully' };
    }
    async getDeletedProducts() {
        this.logger.log('Fetching deleted products');
        const deletedProducts = await this.prisma.product.findMany({
            where: {
                deletedAt: { not: null }
            },
            include: {
                uom: {
                    select: {
                        id: true,
                        name: true,
                        symbol: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: { deletedAt: 'desc' },
        });
        this.logger.log(`Found ${deletedProducts.length} deleted products`);
        return deletedProducts;
    }
    async restoreProduct(id) {
        this.logger.log(`Restoring product: ${id}`);
        const product = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (!product.deletedAt) {
            throw new common_1.ConflictException('Product is not deleted');
        }
        await this.prisma.product.update({
            where: { id },
            data: {
                deletedAt: null,
                isActive: true
            },
        });
        this.logger.log(`Product restored successfully: ${id}`);
        return { message: 'Product restored successfully' };
    }
    async permanentDelete(id) {
        this.logger.log(`Permanently deleting product: ${id}`);
        const product = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (!product.deletedAt) {
            throw new common_1.ConflictException('Product must be soft deleted before permanent deletion');
        }
        const stockBalances = await this.prisma.stockBalance.findMany({
            where: { productId: id },
        });
        if (stockBalances.length > 0) {
            this.logger.warn(`Cannot permanently delete product ${id}: has existing stock balances`);
            throw new common_1.ConflictException('Cannot permanently delete product with existing stock balances');
        }
        await this.prisma.product.delete({
            where: { id },
        });
        this.logger.log(`Product permanently deleted: ${id}`);
        return { message: 'Product permanently deleted' };
    }
    async bulkPermanentDelete(ids) {
        this.logger.log(`Bulk permanently deleting ${ids.length} products`);
        if (ids.length === 0) {
            throw new common_1.BadRequestException('No products selected for deletion');
        }
        const products = await this.prisma.product.findMany({
            where: {
                id: { in: ids },
                deletedAt: { not: null }
            },
        });
        if (products.length !== ids.length) {
            const foundIds = products.map(p => p.id);
            const missingIds = ids.filter(id => !foundIds.includes(id));
            throw new common_1.NotFoundException(`Products not found or not soft deleted: ${missingIds.join(', ')}`);
        }
        const productsWithStock = await this.prisma.stockBalance.findMany({
            where: {
                productId: { in: ids }
            },
            select: { productId: true }
        });
        if (productsWithStock.length > 0) {
            const productIdsWithStock = [...new Set(productsWithStock.map(sb => sb.productId))];
            throw new common_1.ConflictException(`Cannot permanently delete products with existing stock balances: ${productIdsWithStock.join(', ')}`);
        }
        const deletedProducts = await this.prisma.product.deleteMany({
            where: { id: { in: ids } },
        });
        this.logger.log(`Bulk permanently deleted ${deletedProducts.count} products`);
        return {
            message: `${deletedProducts.count} products permanently deleted successfully`,
            deletedCount: deletedProducts.count
        };
    }
    async downloadTemplate() {
        this.logger.log('Generating bulk import template with UOMs');
        const uoms = await this.prisma.uOM.findMany({
            where: { isActive: true },
            select: { symbol: true, name: true },
            orderBy: { name: 'asc' }
        });
        const sampleData = [
            {
                'Product Name': 'Sample Product 1',
                'Category': 'Electronics',
                'UOM': 'pcs',
                'Description': 'Sample product description',
                'Barcode': '1234567890123',
                'Supplier Name': 'Sample Supplier',
                'Cost Price': 100.00,
                'Selling Price': 150.00,
                'Reorder Level': 10,
                'Min Stock': 5,
                'Max Stock': 100,
                'Is Active': true
            },
            {
                'Product Name': 'Sample Product 2',
                'Category': 'Clothing',
                'UOM': 'pcs',
                'Description': 'Another sample product',
                'Barcode': '9876543210987',
                'Supplier Name': 'Another Supplier',
                'Cost Price': 50.00,
                'Selling Price': 75.00,
                'Reorder Level': 5,
                'Min Stock': 2,
                'Max Stock': 50,
                'Is Active': true
            }
        ];
        const xlsx = require('xlsx');
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(sampleData);
        const uomReferenceData = uoms.map(uom => ({ 'UOM Symbol': uom.symbol, 'UOM Name': uom.name }));
        const uomSheet = xlsx.utils.json_to_sheet(uomReferenceData);
        const commonCategories = ['Electronics', 'Clothing', 'Food & Beverage', 'Books', 'Toys', 'Home & Garden', 'Sports', 'Health & Beauty'];
        const categoryReferenceData = commonCategories.map(cat => ({ 'Category': cat }));
        const categorySheet = xlsx.utils.json_to_sheet(categoryReferenceData);
        const instructionsData = [
            { 'Field': 'Product Name', 'Required': 'Yes', 'Description': 'Name of the product', 'Example': 'iPhone 15 Pro' },
            { 'Field': 'Category', 'Required': 'No', 'Description': 'Product category (see Category Reference sheet)', 'Example': 'Electronics' },
            { 'Field': 'UOM', 'Required': 'Yes', 'Description': 'Unit of measure (see UOM Reference sheet)', 'Example': 'pcs' },
            { 'Field': 'Description', 'Required': 'No', 'Description': 'Product description', 'Example': 'Latest iPhone model' },
            { 'Field': 'Barcode', 'Required': 'No', 'Description': 'Product barcode', 'Example': '1234567890123' },
            { 'Field': 'Supplier Name', 'Required': 'No', 'Description': 'Supplier name', 'Example': 'Apple Inc.' },
            { 'Field': 'Cost Price', 'Required': 'No', 'Description': 'Cost price (numbers only)', 'Example': '800.00' },
            { 'Field': 'Selling Price', 'Required': 'No', 'Description': 'Selling price (numbers only)', 'Example': '999.00' },
            { 'Field': 'Reorder Level', 'Required': 'No', 'Description': 'Reorder level (numbers only)', 'Example': '10' },
            { 'Field': 'Min Stock', 'Required': 'No', 'Description': 'Minimum stock (numbers only)', 'Example': '5' },
            { 'Field': 'Max Stock', 'Required': 'No', 'Description': 'Maximum stock (numbers only)', 'Example': '100' },
            { 'Field': 'Is Active', 'Required': 'No', 'Description': 'Active status (true/false)', 'Example': 'true' }
        ];
        const instructionsSheet = xlsx.utils.json_to_sheet(instructionsData);
        const setupInstructions = [
            { 'Step': '1', 'Action': 'Download Template', 'Description': 'Download this Excel template file' },
            { 'Step': '2', 'Action': 'Check Reference Sheets', 'Description': 'Review UOM Reference and Category Reference sheets for valid options' },
            { 'Step': '3', 'Action': 'Fill Product Data', 'Description': 'Enter your product information in the Products sheet' },
            { 'Step': '4', 'Action': 'Use Valid UOMs', 'Description': 'For UOM column, use only values from UOM Reference sheet (e.g., pcs, kg, l, etc.)' },
            { 'Step': '5', 'Action': 'Use Valid Categories', 'Description': 'For Category column, use only values from Category Reference sheet' },
            { 'Step': '6', 'Action': 'Save and Upload', 'Description': 'Save the file and upload it through the bulk import interface' },
            { 'Step': '7', 'Action': 'Auto-SKU Generation', 'Description': 'SKUs will be automatically generated for all products' }
        ];
        const setupSheet = xlsx.utils.json_to_sheet(setupInstructions);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');
        xlsx.utils.book_append_sheet(workbook, instructionsSheet, 'Field Instructions');
        xlsx.utils.book_append_sheet(workbook, uomSheet, 'UOM Reference');
        xlsx.utils.book_append_sheet(workbook, categorySheet, 'Category Reference');
        xlsx.utils.book_append_sheet(workbook, setupSheet, 'Setup Instructions');
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return {
            filename: 'product-import-template.xlsx',
            content: buffer,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
    }
    async previewBulkImport(file) {
        this.logger.log(`Previewing bulk import file: ${file.originalname}`);
        try {
            const data = await this.parseFile(file);
            this.logger.log(`Parsed ${data.length} products from file`);
            return data;
        }
        catch (error) {
            this.logger.error('Error parsing file:', error);
            throw new common_1.BadRequestException('Invalid file format. Please use CSV or Excel format.');
        }
    }
    async bulkImport(file, userId) {
        this.logger.log(`Starting bulk import for file: ${file.originalname}`);
        let importRecord = null;
        if (userId) {
            importRecord = await this.prisma.bulkImportRecord.create({
                data: {
                    fileName: file.filename || file.originalname,
                    originalFileName: file.originalname,
                    status: 'processing',
                    totalRecords: 0,
                    successfulRecords: 0,
                    failedRecords: 0,
                    errors: [],
                    userId: userId,
                    summary: {
                        productsCreated: 0,
                        productsUpdated: 0,
                        categoriesCreated: 0,
                        uomsCreated: 0
                    }
                }
            });
        }
        try {
            const data = await this.parseFile(file);
            const results = {
                imported: 0,
                failed: 0,
                errors: []
            };
            if (importRecord) {
                await this.prisma.bulkImportRecord.update({
                    where: { id: importRecord.id },
                    data: { totalRecords: data.length }
                });
            }
            for (let i = 0; i < data.length; i++) {
                try {
                    const productData = data[i];
                    if (!productData.name) {
                        results.failed++;
                        results.errors.push({
                            row: i + 2,
                            field: 'name',
                            message: 'Product name is required'
                        });
                        continue;
                    }
                    const timestamp = Date.now();
                    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
                    const generatedSku = `PROD-${timestamp}-${randomSuffix}`;
                    let finalSku = generatedSku;
                    let counter = 1;
                    while (await this.prisma.product.findUnique({ where: { sku: finalSku } })) {
                        finalSku = `${generatedSku}-${counter}`;
                        counter++;
                    }
                    const uom = await this.prisma.uOM.findUnique({
                        where: { symbol: productData.uomId || 'pcs' }
                    });
                    if (!uom) {
                        results.failed++;
                        results.errors.push({
                            row: i + 2,
                            field: 'uom',
                            message: 'Invalid UOM symbol'
                        });
                        continue;
                    }
                    let categoryId = null;
                    if (productData.category) {
                        let category = await this.prisma.category.findFirst({
                            where: {
                                name: {
                                    equals: productData.category,
                                    mode: 'insensitive'
                                }
                            }
                        });
                        if (!category) {
                            category = await this.prisma.category.create({
                                data: {
                                    name: productData.category,
                                    description: `Category for ${productData.category}`,
                                    isActive: true,
                                }
                            });
                        }
                        categoryId = category.id;
                    }
                    const createdProduct = await this.prisma.product.create({
                        data: {
                            name: productData.name,
                            sku: finalSku,
                            categoryId: categoryId,
                            uomId: uom.id,
                            reorderLevel: productData.reorderLevel || 0,
                            description: productData.description || null,
                            barcode: productData.barcode || null,
                            supplierName: productData.supplierName || null,
                            costPrice: productData.costPrice || null,
                            sellingPrice: productData.sellingPrice || null,
                            minStock: productData.minStock || 0,
                            maxStock: productData.maxStock || null,
                            isActive: productData.isActive !== false,
                        }
                    });
                    results.imported++;
                }
                catch (error) {
                    results.failed++;
                    results.errors.push({
                        row: i + 2,
                        field: 'general',
                        message: error.message || 'Unknown error'
                    });
                }
            }
            this.logger.log(`Bulk import completed: ${results.imported} imported, ${results.failed} failed`);
            if (importRecord) {
                await this.prisma.bulkImportRecord.update({
                    where: { id: importRecord.id },
                    data: {
                        status: results.failed === 0 ? 'completed' : 'completed',
                        successfulRecords: results.imported,
                        failedRecords: results.failed,
                        errors: results.errors.map(err => `Row ${err.row}: ${err.message}`),
                        completedAt: new Date(),
                        summary: {
                            productsCreated: results.imported,
                            productsUpdated: 0,
                            categoriesCreated: 0,
                            uomsCreated: 0
                        }
                    }
                });
            }
            return {
                success: true,
                message: `Import completed. ${results.imported} products imported successfully, ${results.failed} failed.`,
                data: results
            };
        }
        catch (error) {
            this.logger.error('Bulk import error:', error);
            if (importRecord) {
                await this.prisma.bulkImportRecord.update({
                    where: { id: importRecord.id },
                    data: {
                        status: 'failed',
                        errors: [error.message || 'Unknown error occurred'],
                        completedAt: new Date()
                    }
                });
            }
            throw new common_1.BadRequestException('Error processing file. Please check the format and try again.');
        }
    }
    async parseFile(file) {
        const fs = require('fs');
        const path = require('path');
        const csv = require('csv-parser');
        const xlsx = require('xlsx');
        const tempPath = file.path;
        try {
            if (file.mimetype === 'text/csv') {
                return new Promise((resolve, reject) => {
                    const results = [];
                    fs.createReadStream(tempPath)
                        .pipe(csv())
                        .on('data', (data) => {
                        const mappedData = {
                            name: data['Product Name'] || data.name,
                            category: data['Category'] || data.category,
                            uomId: data['UOM'] || data.uom || 'pcs',
                            reorderLevel: parseFloat(data['Reorder Level'] || data.reorderLevel || '0'),
                            description: data['Description'] || data.description,
                            barcode: data['Barcode'] || data.barcode,
                            supplierName: data['Supplier Name'] || data.supplierName,
                            costPrice: parseFloat(data['Cost Price'] || data.costPrice || '0'),
                            sellingPrice: parseFloat(data['Selling Price'] || data.sellingPrice || '0'),
                            minStock: parseInt(data['Min Stock'] || data.minStock || '0'),
                            maxStock: parseInt(data['Max Stock'] || data.maxStock || '0'),
                            isActive: data['Is Active'] === 'true' || data.isActive === true
                        };
                        results.push(mappedData);
                    })
                        .on('end', () => resolve(results))
                        .on('error', reject);
                });
            }
            else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.mimetype === 'application/vnd.ms-excel') {
                const workbook = xlsx.readFile(tempPath);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = xlsx.utils.sheet_to_json(worksheet);
                return jsonData.map((row) => ({
                    name: row['Product Name'] || row.name,
                    category: row['Category'] || row.category,
                    uomId: row['UOM'] || row.uom || 'pcs',
                    reorderLevel: parseFloat(row['Reorder Level'] || row.reorderLevel || '0'),
                    description: row['Description'] || row.description,
                    barcode: row['Barcode'] || row.barcode,
                    supplierName: row['Supplier Name'] || row.supplierName,
                    costPrice: parseFloat(row['Cost Price'] || row.costPrice || '0'),
                    sellingPrice: parseFloat(row['Selling Price'] || row.sellingPrice || '0'),
                    minStock: parseInt(row['Min Stock'] || row.minStock || '0'),
                    maxStock: parseInt(row['Max Stock'] || row.maxStock || '0'),
                    isActive: row['Is Active'] === 'true' || row.isActive === true
                }));
            }
            else {
                throw new Error('Unsupported file format');
            }
        }
        finally {
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        }
    }
    async getCategories() {
        this.logger.log('Fetching product categories');
        const categories = await this.prisma.category.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
        this.logger.log(`Found ${categories.length} active categories`);
        return categories;
    }
    async createCategory(name) {
        this.logger.log(`Creating category: ${name}`);
        const existingCategory = await this.prisma.category.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive'
                }
            },
        });
        if (existingCategory) {
            this.logger.warn(`Category already exists: ${name}`);
            throw new common_1.ConflictException('A category with this name already exists');
        }
        const category = await this.prisma.category.create({
            data: {
                name: name,
                description: `Category for ${name}`,
                isActive: true,
            },
        });
        this.logger.log(`Category created successfully: ${category.id}`);
        return category;
    }
    async updateCategory(oldName, newName) {
        this.logger.log(`Updating category from ${oldName} to ${newName}`);
        const category = await this.prisma.category.findFirst({
            where: {
                name: {
                    equals: oldName,
                    mode: 'insensitive'
                }
            },
        });
        if (!category) {
            this.logger.warn(`Category not found: ${oldName}`);
            throw new common_1.NotFoundException('Category not found');
        }
        const newCategoryExists = await this.prisma.category.findFirst({
            where: {
                name: {
                    equals: newName,
                    mode: 'insensitive'
                },
                id: { not: category.id }
            },
        });
        if (newCategoryExists) {
            this.logger.warn(`New category name already exists: ${newName}`);
            throw new common_1.ConflictException('A category with this name already exists');
        }
        const updatedCategory = await this.prisma.category.update({
            where: { id: category.id },
            data: { name: newName },
        });
        this.logger.log(`Category updated successfully from ${oldName} to ${newName}`);
        return updatedCategory;
    }
    async deleteCategory(name) {
        this.logger.log(`Deleting category: ${name}`);
        const category = await this.prisma.category.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive'
                }
            },
        });
        if (!category) {
            this.logger.warn(`Category not found: ${name}`);
            throw new common_1.NotFoundException('Category not found');
        }
        const productCount = await this.prisma.product.count({
            where: { categoryId: category.id },
        });
        if (productCount > 0) {
            this.logger.warn(`Cannot delete category with products: ${name} (${productCount} products)`);
            throw new common_1.BadRequestException(`Cannot delete category. It has ${productCount} product(s) associated with it.`);
        }
        await this.prisma.category.delete({
            where: { id: category.id },
        });
        this.logger.log(`Category deleted successfully: ${name}`);
        return { message: 'Category deleted successfully', category: name };
    }
    async getUOMs() {
        this.logger.log('Fetching units of measure');
        const uoms = await this.prisma.uOM.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
        const uomsWithCount = uoms.map(uom => ({
            id: uom.id,
            name: uom.name,
            symbol: uom.symbol,
            description: uom.description,
            isActive: uom.isActive,
            createdAt: uom.createdAt,
            updatedAt: uom.updatedAt,
            productCount: uom._count.products
        }));
        this.logger.log(`Found ${uomsWithCount.length} UOMs`);
        return uomsWithCount;
    }
    async findByBarcode(barcode) {
        this.logger.log(`Finding product by barcode: ${barcode}`);
        const product = await this.prisma.product.findUnique({
            where: { barcode },
        });
        if (!product) {
            this.logger.warn(`Product with barcode ${barcode} not found`);
            throw new common_1.NotFoundException('Product not found');
        }
        this.logger.log(`Product found by barcode: ${product.name}`);
        return product;
    }
    async bulkCreate(products) {
        this.logger.log(`Bulk creating ${products.length} products`);
        const skus = products.map(p => p.sku);
        const uniqueSkus = new Set(skus);
        if (skus.length !== uniqueSkus.size) {
            throw new common_1.ConflictException('Duplicate SKUs found in bulk create');
        }
        const existingProducts = await this.prisma.product.findMany({
            where: { sku: { in: skus } },
            select: { sku: true },
        });
        if (existingProducts.length > 0) {
            const existingSkus = existingProducts.map(p => p.sku);
            throw new common_1.ConflictException(`Products with SKUs already exist: ${existingSkus.join(', ')}`);
        }
        const createdProducts = await this.prisma.product.createMany({
            data: products,
        });
        this.logger.log(`Bulk created ${createdProducts.count} products`);
        return { count: createdProducts.count, message: 'Products created successfully' };
    }
    async bulkUpdate(updates) {
        this.logger.log(`Bulk updating ${updates.length} products`);
        const results = [];
        for (const update of updates) {
            try {
                const updatedProduct = await this.update(update.id, update.data);
                results.push({ id: update.id, success: true, data: updatedProduct });
            }
            catch (error) {
                results.push({ id: update.id, success: false, error: error.message });
            }
        }
        const successCount = results.filter(r => r.success).length;
        this.logger.log(`Bulk update completed: ${successCount}/${updates.length} successful`);
        return { results, successCount, totalCount: updates.length };
    }
    async bulkDelete(ids) {
        this.logger.log(`Bulk soft deleting ${ids.length} products`);
        const products = await this.prisma.product.findMany({
            where: {
                id: { in: ids },
                deletedAt: null
            },
            select: { id: true, name: true }
        });
        if (products.length === 0) {
            throw new common_1.NotFoundException('No valid products found to delete');
        }
        const productsWithStock = await this.prisma.stockBalance.findMany({
            where: { productId: { in: products.map(p => p.id) } },
            select: { productId: true },
        });
        if (productsWithStock.length > 0) {
            const productIds = productsWithStock.map(s => s.productId);
            throw new common_1.ConflictException(`Cannot delete products with existing stock: ${productIds.join(', ')}`);
        }
        const deletedProducts = await this.prisma.product.updateMany({
            where: {
                id: { in: products.map(p => p.id) },
                deletedAt: null
            },
            data: {
                deletedAt: new Date(),
                isActive: false
            },
        });
        this.logger.log(`Bulk soft deleted ${deletedProducts.count} products`);
        return { count: deletedProducts.count, message: 'Products deleted successfully' };
    }
    async toggleActive(id) {
        this.logger.log(`Toggling active status for product: ${id}`);
        const product = await this.findOne(id);
        const updatedProduct = await this.prisma.product.update({
            where: { id },
            data: { isActive: !product.isActive },
        });
        this.logger.log(`Product ${id} is now ${updatedProduct.isActive ? 'active' : 'inactive'}`);
        return updatedProduct;
    }
    async getProductPerformance(filters) {
        this.logger.log('Fetching product performance metrics');
        const where = {};
        if (filters?.category) {
            if (typeof filters.category === 'string' && !filters.category.includes('-')) {
                const categoryRecord = await this.prisma.category.findFirst({
                    where: {
                        name: {
                            equals: filters.category,
                            mode: 'insensitive'
                        }
                    },
                    select: { id: true }
                });
                if (categoryRecord) {
                    where.categoryId = categoryRecord.id;
                }
                else {
                    where.categoryId = 'non-existent-id';
                }
            }
            else {
                where.categoryId = filters.category;
            }
        }
        if (filters?.supplierId)
            where.supplierId = filters.supplierId;
        const [totalProducts, activeProducts, lowStockProducts, outOfStockProducts, categoryStats, supplierStats] = await Promise.all([
            this.prisma.product.count({ where }),
            this.prisma.product.count({ where: { ...where, isActive: true } }),
            this.prisma.product.count({
                where: {
                    ...where,
                    isActive: true,
                    reorderLevel: { gt: 0 }
                }
            }),
            this.prisma.product.count({
                where: {
                    ...where,
                    isActive: true,
                    reorderLevel: { lte: 0 }
                }
            }),
            this.prisma.product.groupBy({
                by: ['categoryId'],
                where: { ...where, categoryId: { not: null } },
                _count: { categoryId: true },
            }),
            this.prisma.product.groupBy({
                by: ['supplierId'],
                where: { ...where, supplierId: { not: null } },
                _count: { supplierId: true },
            })
        ]);
        const performance = {
            totalProducts,
            activeProducts,
            inactiveProducts: totalProducts - activeProducts,
            lowStockProducts,
            outOfStockProducts,
            categoryDistribution: categoryStats.map(stat => ({
                categoryId: stat.categoryId,
                count: stat._count.categoryId
            })),
            supplierDistribution: supplierStats.map(stat => ({
                supplierId: stat.supplierId,
                count: stat._count.supplierId
            }))
        };
        this.logger.log(`Product performance metrics calculated`);
        return performance;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = ProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ProductsService);
//# sourceMappingURL=products.service.js.map