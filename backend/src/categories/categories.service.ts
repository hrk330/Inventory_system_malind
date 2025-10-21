import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, getPaginationParams } from '../common/utils/pagination.helper';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    this.logger.log(`Creating category: ${createCategoryDto.name}`);

    // Check if category already exists
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
      throw new ConflictException('A category with this name already exists');
    }

    const category = await this.prisma.category.create({
      data: createCategoryDto,
    });

    this.logger.log(`Category created successfully: ${category.id}`);
    return category;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);
    
    this.logger.log('Fetching all categories');
    
    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        orderBy: { name: 'asc' },
        skip,
        take,
      }),
      this.prisma.category.count(),
    ]);

    this.logger.log(`Found ${total} total categories, returning ${categories.length} for page ${page}`);
    return createPaginatedResponse(categories, total, page, limit);
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

  async findOne(id: string) {
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
      throw new NotFoundException('Category not found');
    }

    this.logger.log(`Category found: ${category.name}`);
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    this.logger.log(`Updating category: ${id}`);
    
    // Check if category exists
    await this.findOne(id);

    // Check if new name conflicts with existing category
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
        throw new ConflictException('A category with this name already exists');
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    this.logger.log(`Category updated successfully: ${updatedCategory.id}`);
    return updatedCategory;
  }

  async remove(id: string) {
    this.logger.log(`Deleting category: ${id}`);
    
    // Check if category exists
    const category = await this.findOne(id);

    // Check if category has products
    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      this.logger.warn(`Cannot delete category with products: ${id} (${productCount} products)`);
      throw new BadRequestException(`Cannot delete category. It has ${productCount} product(s) associated with it.`);
    }

    await this.prisma.category.delete({
      where: { id },
    });

    this.logger.log(`Category deleted successfully: ${id}`);
    return { message: 'Category deleted successfully' };
  }

  async toggleActive(id: string) {
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

  async bulkDelete(ids: string[]) {
    this.logger.log(`Bulk deleting ${ids.length} categories`);
    
    // Check for categories with products
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
      throw new ConflictException(`Cannot delete categories with products: ${categoryNames.join(', ')}`);
    }

    const deletedCategories = await this.prisma.category.deleteMany({
      where: { id: { in: ids } },
    });

    this.logger.log(`Bulk deleted ${deletedCategories.count} categories`);
    return { count: deletedCategories.count, message: 'Categories deleted successfully' };
  }
}
