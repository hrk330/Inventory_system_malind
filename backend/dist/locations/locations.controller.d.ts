import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
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
    getTypes(): Promise<string[]>;
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
    bulkDelete(bulkDeleteDto: {
        ids: string[];
    }): Promise<{
        count: number;
        message: string;
    }>;
}
