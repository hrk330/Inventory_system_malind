import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, getPaginationParams } from '../common/utils/pagination.helper';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto) {
    // Check if location name already exists
    const existingLocation = await this.prisma.location.findFirst({
      where: { name: createLocationDto.name },
    });

    if (existingLocation) {
      throw new ConflictException('Location with this name already exists');
    }

    return this.prisma.location.create({
      data: createLocationDto,
    });
  }

  async findAll(
    paginationDto: PaginationDto,
    search?: string,
    type?: string
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (type) {
      where.type = type;
    }

    const [locations, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.location.count({ where }),
    ]);

    return createPaginatedResponse(locations, total, page, limit);
  }

  async findOne(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    // Check if location exists
    await this.findOne(id);

    // Check if name is being changed and if new name already exists
    if (updateLocationDto.name) {
      const existingLocation = await this.prisma.location.findFirst({
        where: { 
          name: updateLocationDto.name,
          id: { not: id }
        },
      });

      if (existingLocation) {
        throw new ConflictException('Location with this name already exists');
      }
    }

    return this.prisma.location.update({
      where: { id },
      data: updateLocationDto,
    });
  }

  async remove(id: string) {
    // Check if location exists
    await this.findOne(id);

    // Check if location has stock balances
    const stockBalances = await this.prisma.stockBalance.findMany({
      where: { locationId: id },
    });

    if (stockBalances.length > 0) {
      throw new ConflictException('Cannot delete location with existing stock balances');
    }

    await this.prisma.location.delete({
      where: { id },
    });

    return { message: 'Location deleted successfully' };
  }

  async getTypes() {
    return ['WAREHOUSE', 'STORE'];
  }

  async bulkDelete(ids: string[]) {
    this.logger.log(`Bulk deleting ${ids.length} locations`);
    
    // Check for locations with stock balances
    const locationsWithStock = await this.prisma.location.findMany({
      where: { 
        id: { in: ids },
        stockBalances: {
          some: {}
        }
      },
      select: { id: true, name: true }
    });

    if (locationsWithStock.length > 0) {
      const locationNames = locationsWithStock.map(l => l.name);
      throw new ConflictException(`Cannot delete locations with existing stock: ${locationNames.join(', ')}`);
    }

    const deletedLocations = await this.prisma.location.deleteMany({
      where: { id: { in: ids } },
    });

    this.logger.log(`Bulk deleted ${deletedLocations.count} locations`);
    return { count: deletedLocations.count, message: 'Locations deleted successfully' };
  }
}
