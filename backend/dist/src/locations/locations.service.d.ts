import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
export declare class LocationsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(createLocationDto: CreateLocationDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.LocationType;
        address: string | null;
    }>;
    findAll(search?: string, type?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.LocationType;
        address: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.LocationType;
        address: string | null;
    }>;
    update(id: string, updateLocationDto: UpdateLocationDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.LocationType;
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
