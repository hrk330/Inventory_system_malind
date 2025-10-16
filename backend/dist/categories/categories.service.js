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
var CategoriesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = CategoriesService_1 = class CategoriesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CategoriesService_1.name);
    }
    async create(createCategoryDto) {
        this.logger.log(`Creating category: ${createCategoryDto.name}`);
        const existingCategory = await this.prisma.category.findFirst({
            where: {
                name: {
                    equals: createCategoryDto.name,
                    mode: 'insensitive'
                }
            },
        });
        if (existingCategory) {
            this.logger.warn(`Category already exists: ${createCategoryDto.name}`);
            throw new common_1.ConflictException('A category with this name already exists');
        }
        const category = await this.prisma.category.create({
            data: createCategoryDto,
        });
        this.logger.log(`Category created successfully: ${category.id}`);
        return category;
    }
    async findAll() {
        this.logger.log('Fetching all categories');
        const categories = await this.prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
        this.logger.log(`Found ${categories.length} categories`);
        return categories;
    }
    async findActive() {
        this.logger.log('Fetching active categories');
        const categories = await this.prisma.category.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
        this.logger.log(`Found ${categories.length} active categories`);
        return categories;
    }
    async findOne(id) {
        this.logger.log(`Fetching category: ${id}`);
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                products: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                        isActive: true,
                    },
                },
            },
        });
        if (!category) {
            this.logger.warn(`Category not found: ${id}`);
            throw new common_1.NotFoundException('Category not found');
        }
        this.logger.log(`Category found: ${category.name}`);
        return category;
    }
    async update(id, updateCategoryDto) {
        this.logger.log(`Updating category: ${id}`);
        await this.findOne(id);
        if (updateCategoryDto.name) {
            const existingCategory = await this.prisma.category.findFirst({
                where: {
                    name: {
                        equals: updateCategoryDto.name,
                        mode: 'insensitive'
                    },
                    id: { not: id }
                },
            });
            if (existingCategory) {
                this.logger.warn(`Category name conflict: ${updateCategoryDto.name}`);
                throw new common_1.ConflictException('A category with this name already exists');
            }
        }
        const updatedCategory = await this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
        this.logger.log(`Category updated successfully: ${updatedCategory.id}`);
        return updatedCategory;
    }
    async remove(id) {
        this.logger.log(`Deleting category: ${id}`);
        const category = await this.findOne(id);
        const productCount = await this.prisma.product.count({
            where: { categoryId: id },
        });
        if (productCount > 0) {
            this.logger.warn(`Cannot delete category with products: ${id} (${productCount} products)`);
            throw new common_1.BadRequestException(`Cannot delete category. It has ${productCount} product(s) associated with it.`);
        }
        await this.prisma.category.delete({
            where: { id },
        });
        this.logger.log(`Category deleted successfully: ${id}`);
        return { message: 'Category deleted successfully' };
    }
    async toggleActive(id) {
        this.logger.log(`Toggling active status for category: ${id}`);
        const category = await this.findOne(id);
        const updatedCategory = await this.prisma.category.update({
            where: { id },
            data: { isActive: !category.isActive },
        });
        this.logger.log(`Category ${id} is now ${updatedCategory.isActive ? 'active' : 'inactive'}`);
        return updatedCategory;
    }
    async getCategoryStats() {
        this.logger.log('Fetching category statistics');
        const [totalCategories, activeCategories, categoriesWithProducts] = await Promise.all([
            this.prisma.category.count(),
            this.prisma.category.count({ where: { isActive: true } }),
            this.prisma.category.count({
                where: {
                    products: {
                        some: {}
                    }
                }
            })
        ]);
        const stats = {
            total: totalCategories,
            active: activeCategories,
            inactive: totalCategories - activeCategories,
            withProducts: categoriesWithProducts,
            empty: totalCategories - categoriesWithProducts
        };
        this.logger.log(`Category stats: ${JSON.stringify(stats)}`);
        return stats;
    }
    async bulkDelete(ids) {
        this.logger.log(`Bulk deleting ${ids.length} categories`);
        const categoriesWithProducts = await this.prisma.category.findMany({
            where: {
                id: { in: ids },
                products: {
                    some: {}
                }
            },
            select: { id: true, name: true }
        });
        if (categoriesWithProducts.length > 0) {
            const categoryNames = categoriesWithProducts.map(c => c.name);
            throw new common_1.ConflictException(`Cannot delete categories with products: ${categoryNames.join(', ')}`);
        }
        const deletedCategories = await this.prisma.category.deleteMany({
            where: { id: { in: ids } },
        });
        this.logger.log(`Bulk deleted ${deletedCategories.count} categories`);
        return { count: deletedCategories.count, message: 'Categories deleted successfully' };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = CategoriesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map