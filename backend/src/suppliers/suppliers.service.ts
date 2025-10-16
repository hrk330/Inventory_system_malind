import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    this.logger.log(`Creating supplier: ${createSupplierDto.name}`);
    
    // Check if supplier with same name already exists
    const existingSupplier = await this.prisma.supplier.findFirst({
      where: { name: createSupplierDto.name },
    });

    if (existingSupplier) {
      this.logger.warn(`Supplier with name ${createSupplierDto.name} already exists`);
      throw new ConflictException('Supplier with this name already exists');
    }

    const supplier = await this.prisma.supplier.create({
      data: createSupplierDto,
    });

    this.logger.log(`Supplier created successfully: ${supplier.id}`);
    return supplier;
  }

  async findAll(search?: string) {
    this.logger.log(`Fetching suppliers - search: ${search || 'none'}`);
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const suppliers = await this.prisma.supplier.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    this.logger.log(`Found ${suppliers.length} suppliers`);
    return suppliers;
  }

  async findOne(id: string) {
    this.logger.log(`Fetching supplier: ${id}`);
    
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      this.logger.warn(`Supplier not found: ${id}`);
      throw new NotFoundException('Supplier not found');
    }

    this.logger.log(`Supplier found: ${supplier.name}`);
    return supplier;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    this.logger.log(`Updating supplier: ${id}`);
    
    // Check if supplier exists
    await this.findOne(id);

    // Check if name is being changed and if new name already exists
    if (updateSupplierDto.name) {
      const existingSupplier = await this.prisma.supplier.findFirst({
        where: { 
          name: updateSupplierDto.name,
          id: { not: id }
        },
      });

      if (existingSupplier) {
        this.logger.warn(`Supplier with name ${updateSupplierDto.name} already exists`);
        throw new ConflictException('Supplier with this name already exists');
      }
    }

    const updatedSupplier = await this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });

    this.logger.log(`Supplier updated successfully: ${updatedSupplier.id}`);
    return updatedSupplier;
  }

  async remove(id: string) {
    this.logger.log(`Deleting supplier: ${id}`);
    
    // Check if supplier exists
    await this.findOne(id);

    // Check if supplier has products
    const products = await this.prisma.product.findMany({
      where: { supplierId: id },
    });

    if (products.length > 0) {
      this.logger.warn(`Cannot delete supplier ${id}: has associated products`);
      throw new ConflictException('Cannot delete supplier with associated products');
    }

    await this.prisma.supplier.delete({
      where: { id },
    });

    this.logger.log(`Supplier deleted successfully: ${id}`);
    return { message: 'Supplier deleted successfully' };
  }

  async toggleActive(id: string) {
    this.logger.log(`Toggling active status for supplier: ${id}`);
    
    const supplier = await this.findOne(id);
    
    const updatedSupplier = await this.prisma.supplier.update({
      where: { id },
      data: { isActive: !supplier.isActive },
    });

    this.logger.log(`Supplier ${id} is now ${updatedSupplier.isActive ? 'active' : 'inactive'}`);
    return updatedSupplier;
  }

  async bulkDelete(ids: string[]) {
    this.logger.log(`Bulk deleting ${ids.length} suppliers`);
    
    // Check for suppliers with products
    const suppliersWithProducts = await this.prisma.supplier.findMany({
      where: { 
        id: { in: ids },
        products: {
          some: {}
        }
      },
      select: { id: true, name: true }
    });

    if (suppliersWithProducts.length > 0) {
      const supplierNames = suppliersWithProducts.map(s => s.name);
      throw new ConflictException(`Cannot delete suppliers with products: ${supplierNames.join(', ')}`);
    }

    const deletedSuppliers = await this.prisma.supplier.deleteMany({
      where: { id: { in: ids } },
    });

    this.logger.log(`Bulk deleted ${deletedSuppliers.count} suppliers`);
    return { count: deletedSuppliers.count, message: 'Suppliers deleted successfully' };
  }
}
