import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SuppliersController {
    private readonly suppliersService;
    constructor(suppliersService: SuppliersService);
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
    bulkDelete(bulkDeleteDto: {
        ids: string[];
    }): Promise<{
        count: number;
        message: string;
    }>;
}
