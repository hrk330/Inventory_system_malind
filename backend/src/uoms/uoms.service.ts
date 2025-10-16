import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUOMDto } from './dto/create-uom.dto';
import { UpdateUOMDto } from './dto/update-uom.dto';

@Injectable()
export class UOMsService {
  private readonly logger = new Logger(UOMsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createUOMDto: CreateUOMDto) {
    this.logger.log(`Creating UOM: ${createUOMDto.name} (${createUOMDto.symbol})`);
    
    // Check if UOM with this symbol already exists
    const existingUOM = await this.prisma.uOM.findUnique({
      where: { symbol: createUOMDto.symbol },
    });

    if (existingUOM) {
      throw new ConflictException('UOM with this symbol already exists');
    }

    const uom = await this.prisma.uOM.create({
      data: createUOMDto,
    });

    this.logger.log(`UOM created successfully: ${uom.id}`);
    return uom;
  }

  async findAll() {
    this.logger.log('Fetching all UOMs');
    
    const uoms = await this.prisma.uOM.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { 
            products: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    // Transform to include product count
    const uomsWithCount = uoms.map(uom => ({
      id: uom.id,
      name: uom.name,
      symbol: uom.symbol,
      description: uom.description,
      isActive: uom.isActive,
      createdAt: uom.createdAt,
      updatedAt: uom.updatedAt,
      productCount: uom._count.products
    }));

    this.logger.log(`Found ${uomsWithCount.length} UOMs`);
    return uomsWithCount;
  }

  async findOne(id: string) {
    this.logger.log(`Finding UOM: ${id}`);
    
    const uom = await this.prisma.uOM.findUnique({
      where: { id },
      include: {
        _count: {
          select: { 
            products: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    if (!uom) {
      throw new NotFoundException('UOM not found');
    }

    return {
      id: uom.id,
      name: uom.name,
      symbol: uom.symbol,
      description: uom.description,
      isActive: uom.isActive,
      createdAt: uom.createdAt,
      updatedAt: uom.updatedAt,
      productCount: uom._count.products
    };
  }

  async update(id: string, updateUOMDto: UpdateUOMDto) {
    this.logger.log(`Updating UOM: ${id}`);
    
    // Check if UOM exists
    const existingUOM = await this.prisma.uOM.findUnique({
      where: { id },
    });

    if (!existingUOM) {
      throw new NotFoundException('UOM not found');
    }

    // If updating symbol, check if new symbol already exists
    if (updateUOMDto.symbol && updateUOMDto.symbol !== existingUOM.symbol) {
      const symbolExists = await this.prisma.uOM.findUnique({
        where: { symbol: updateUOMDto.symbol },
      });

      if (symbolExists) {
        throw new ConflictException('UOM with this symbol already exists');
      }
    }

    const uom = await this.prisma.uOM.update({
      where: { id },
      data: updateUOMDto,
      include: {
        _count: {
          select: { 
            products: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    this.logger.log(`UOM updated successfully: ${id}`);
    return {
      id: uom.id,
      name: uom.name,
      symbol: uom.symbol,
      description: uom.description,
      isActive: uom.isActive,
      createdAt: uom.createdAt,
      updatedAt: uom.updatedAt,
      productCount: uom._count.products
    };
  }

  async remove(id: string) {
    this.logger.log(`Deleting UOM: ${id}`);
    
    // Check if UOM exists
    const existingUOM = await this.prisma.uOM.findUnique({
      where: { id },
      include: {
        _count: {
          select: { 
            products: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    if (!existingUOM) {
      throw new NotFoundException('UOM not found');
    }

    // Check if UOM is being used by any products
    if (existingUOM._count.products > 0) {
      throw new ConflictException('Cannot delete UOM that is being used by products');
    }

    await this.prisma.uOM.delete({
      where: { id },
    });

    this.logger.log(`UOM deleted successfully: ${id}`);
    return { message: 'UOM deleted successfully' };
  }

  async toggleActive(id: string) {
    this.logger.log(`Toggling UOM active status: ${id}`);
    
    const existingUOM = await this.prisma.uOM.findUnique({
      where: { id },
    });

    if (!existingUOM) {
      throw new NotFoundException('UOM not found');
    }

    const uom = await this.prisma.uOM.update({
      where: { id },
      data: { isActive: !existingUOM.isActive },
    });

    this.logger.log(`UOM active status toggled: ${id} -> ${uom.isActive}`);
    return uom;
  }

  async bulkDelete(ids: string[]) {
    this.logger.log(`Bulk deleting ${ids.length} UOMs`);
    
    // Check for UOMs with products
    const uomsWithProducts = await this.prisma.uOM.findMany({
      where: { 
        id: { in: ids },
        products: {
          some: {}
        }
      },
      select: { id: true, name: true, symbol: true }
    });

    if (uomsWithProducts.length > 0) {
      const uomNames = uomsWithProducts.map(u => `${u.name} (${u.symbol})`);
      throw new ConflictException(`Cannot delete UOMs that are being used by products: ${uomNames.join(', ')}`);
    }

    const deletedUOMs = await this.prisma.uOM.deleteMany({
      where: { id: { in: ids } },
    });

    this.logger.log(`Bulk deleted ${deletedUOMs.count} UOMs`);
    return { count: deletedUOMs.count, message: 'UOMs deleted successfully' };
  }
}
