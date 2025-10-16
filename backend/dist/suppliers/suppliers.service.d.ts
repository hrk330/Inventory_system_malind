import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SuppliersService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(createSupplierDto: CreateSupplierDto): Promise<{
        name: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        contactPerson: string | null;
        phone: string | null;
        address: string | null;
    }>;
    findAll(search?: string): Promise<{
        name: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        contactPerson: string | null;
        phone: string | null;
        address: string | null;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        contactPerson: string | null;
        phone: string | null;
        address: string | null;
    }>;
    update(id: string, updateSupplierDto: UpdateSupplierDto): Promise<{
        name: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        contactPerson: string | null;
        phone: string | null;
        address: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string): Promise<{
        name: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        contactPerson: string | null;
        phone: string | null;
        address: string | null;
    }>;
    bulkDelete(ids: string[]): Promise<{
        count: number;
        message: string;
    }>;
}
