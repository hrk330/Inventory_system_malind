import { PrismaService } from '../prisma/prisma.service';
import { CreateUOMDto } from './dto/create-uom.dto';
import { UpdateUOMDto } from './dto/update-uom.dto';
export declare class UOMsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(createUOMDto: CreateUOMDto): Promise<{
        symbol: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        symbol: string;
        description: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        productCount: number;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        symbol: string;
        description: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        productCount: number;
    }>;
    update(id: string, updateUOMDto: UpdateUOMDto): Promise<{
        id: string;
        name: string;
        symbol: string;
        description: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        productCount: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string): Promise<{
        symbol: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
    }>;
    bulkDelete(ids: string[]): Promise<{
        count: number;
        message: string;
    }>;
}
