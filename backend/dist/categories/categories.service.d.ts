import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(createCategoryDto: CreateCategoryDto): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        imageUrl: string | null;
    }>;
    findAll(): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        imageUrl: string | null;
    }[]>;
    findActive(): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        imageUrl: string | null;
    }[]>;
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
    remove(id: string): Promise<{
        message: string;
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
    getCategoryStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        withProducts: number;
        empty: number;
    }>;
    bulkDelete(ids: string[]): Promise<{
        count: number;
        message: string;
    }>;
}
