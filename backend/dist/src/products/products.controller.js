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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_config_1 = require("../config/multer.config");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const bulk_create_product_dto_1 = require("./dto/bulk-create-product.dto");
const bulk_update_product_dto_1 = require("./dto/bulk-update-product.dto");
const bulk_delete_product_dto_1 = require("./dto/bulk-delete-product.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ProductsController = class ProductsController {
    constructor(productsService) {
        this.productsService = productsService;
    }
    create(createProductDto, req) {
        const userId = req.user?.id;
        return this.productsService.create(createProductDto, userId);
    }
    findAll(search, category, status) {
        return this.productsService.findAll(search, category, status);
    }
    getCategories() {
        return this.productsService.getCategories();
    }
    createCategory(body) {
        return this.productsService.createCategory(body.name);
    }
    updateCategory(oldName, body) {
        return this.productsService.updateCategory(oldName, body.newName);
    }
    deleteCategory(name) {
        return this.productsService.deleteCategory(name);
    }
    getUOMs() {
        return this.productsService.getUOMs();
    }
    getDeletedProducts() {
        return this.productsService.getDeletedProducts();
    }
    findOne(id) {
        return this.productsService.findOne(id);
    }
    update(id, updateProductDto, req) {
        const userId = req.user?.id;
        return this.productsService.update(id, updateProductDto, userId);
    }
    bulkDelete(bulkDeleteDto) {
        return this.productsService.bulkDelete(bulkDeleteDto.ids);
    }
    remove(id) {
        return this.productsService.remove(id);
    }
    restoreProduct(id) {
        return this.productsService.restoreProduct(id);
    }
    bulkPermanentDelete(body) {
        return this.productsService.bulkPermanentDelete(body.ids);
    }
    permanentDelete(id) {
        return this.productsService.permanentDelete(id);
    }
    async downloadTemplate(res) {
        const template = await this.productsService.downloadTemplate();
        res.setHeader('Content-Type', template.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${template.filename}"`);
        res.send(template.content);
    }
    previewBulkImport(file) {
        return this.productsService.previewBulkImport(file);
    }
    bulkImport(file, req) {
        const userId = req.user?.id;
        return this.productsService.bulkImport(file, userId);
    }
    findByBarcode(barcode) {
        return this.productsService.findByBarcode(barcode);
    }
    bulkCreate(bulkCreateDto) {
        return this.productsService.bulkCreate(bulkCreateDto.products);
    }
    bulkUpdate(bulkUpdateDto) {
        return this.productsService.bulkUpdate(bulkUpdateDto.updates);
    }
    toggleActive(id) {
        return this.productsService.toggleActive(id);
    }
    getPerformance(category, supplierId) {
        return this.productsService.getProductPerformance({ category, supplierId });
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new product' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Product created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Product with this SKU already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Products retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search by name or SKU' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, description: 'Filter by category' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filter by status (active, inactive, or all)', enum: ['active', 'inactive', 'all'] }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all product categories' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Categories retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new category' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Category created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Category already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Patch)('categories/:oldName'),
    (0, swagger_1.ApiOperation)({ summary: 'Update category name' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'New category name already exists' }),
    __param(0, (0, common_1.Param)('oldName')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:name'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete category' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Get)('uoms'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all units of measure' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'UOMs retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getUOMs", null);
__decorate([
    (0, common_1.Get)('deleted'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all deleted products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Deleted products retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getDeletedProducts", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Product with this SKU already exists' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Products deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Some products cannot be deleted' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_delete_product_dto_1.BulkDeleteProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete product' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Cannot delete product with existing stock' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore deleted product' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product restored successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Product is not deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "restoreProduct", null);
__decorate([
    (0, common_1.Delete)('bulk/permanent'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk permanently delete products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Products permanently deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'No products selected' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Some products not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Cannot permanently delete products with existing stock' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "bulkPermanentDelete", null);
__decorate([
    (0, common_1.Delete)(':id/permanent'),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete product' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product permanently deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Cannot permanently delete product with existing stock' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "permanentDelete", null);
__decorate([
    (0, common_1.Get)('bulk-import/template'),
    (0, swagger_1.ApiOperation)({ summary: 'Download bulk import template' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Template file downloaded' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "downloadTemplate", null);
__decorate([
    (0, common_1.Post)('bulk-import/preview'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', multer_config_1.multerConfig)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Preview bulk import data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Preview data generated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file format' }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "previewBulkImport", null);
__decorate([
    (0, common_1.Post)('bulk-import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', multer_config_1.multerConfig)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk import products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Products imported successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file format' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "bulkImport", null);
__decorate([
    (0, common_1.Get)('barcode/:barcode'),
    (0, swagger_1.ApiOperation)({ summary: 'Find product by barcode' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    __param(0, (0, common_1.Param)('barcode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findByBarcode", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk create products' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Products created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Some products already exist' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_create_product_dto_1.BulkCreateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "bulkCreate", null);
__decorate([
    (0, common_1.Patch)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk update products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Products updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_update_product_dto_1.BulkUpdateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "bulkUpdate", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-active'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle product active status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product status toggled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "toggleActive", null);
__decorate([
    (0, common_1.Get)('performance/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product performance analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Performance data retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, description: 'Filter by category' }),
    (0, swagger_1.ApiQuery)({ name: 'supplierId', required: false, description: 'Filter by supplier ID' }),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('supplierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getPerformance", null);
exports.ProductsController = ProductsController = __decorate([
    (0, swagger_1.ApiTags)('Products'),
    (0, common_1.Controller)('products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map