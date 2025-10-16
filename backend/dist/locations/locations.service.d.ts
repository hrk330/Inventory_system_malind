import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
export declare class LocationsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(createLocationDto: CreateLocationDto): Promise<{
        type: import(".prisma/client").$Enums.LocationType;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
    }>;
    findAll(search?: string, type?: string): Promise<{
        type: import(".prisma/client").$Enums.LocationType;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
    }[]>;
    findOne(id: string): Promise<{
        type: import(".prisma/client").$Enums.LocationType;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
    }>;
    update(id: string, updateLocationDto: UpdateLocationDto): Promise<{
        type: import(".prisma/client").$Enums.LocationType;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getTypes(): Promise<string[]>;
    bulkDelete(ids: string[]): Promise<{
        count: number;
        message: string;
    }>;
}
