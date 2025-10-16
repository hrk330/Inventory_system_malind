import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        imageUrl: string | null;
    }>;
    findAll(active?: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        imageUrl: string | null;
    }[]>;
    getStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        withProducts: number;
        empty: number;
    }>;
    findOne(id: string): Promise<{
        products: {
            name: string;
            id: string;
            sku: string;
            isActive: boolean;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        imageUrl: string | null;
    }>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        imageUrl: string | null;
    }>;
    toggleActive(id: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        imageUrl: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    bulkDelete(bulkDeleteDto: {
        ids: string[];
    }): Promise<{
        count: number;
        message: string;
    }>;
}
