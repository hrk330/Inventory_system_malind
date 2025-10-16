import { UOMsService } from './uoms.service';
import { CreateUOMDto } from './dto/create-uom.dto';
import { UpdateUOMDto } from './dto/update-uom.dto';
export declare class UOMsController {
    private readonly uomsService;
    constructor(uomsService: UOMsService);
    create(createUOMDto: CreateUOMDto): Promise<{
        symbol: string;
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
    bulkDelete(bulkDeleteDto: {
        ids: string[];
    }): Promise<{
        count: number;
        message: string;
    }>;
    toggleActive(id: string): Promise<{
        symbol: string;
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
}
