import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, getPaginationParams } from '../common/utils/pagination.helper';

@Injectable()
export class StockBalancesService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    paginationDto: PaginationDto,
    productId?: string,
    locationId?: string
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);
    
    const where: any = {};
    
    if (productId) {
      where.productId = productId;
    }
    
    if (locationId) {
      where.locationId = locationId;
    }

    const [stockBalances, total] = await Promise.all([
      this.prisma.stockBalance.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              uom: {
                select: {
                  symbol: true
                }
              },
              reorderLevel: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy: [
          { product: { name: 'asc' } },
          { location: { name: 'asc' } },
        ],
        skip,
        take,
      }),
      this.prisma.stockBalance.count({ where }),
    ]);

    return createPaginatedResponse(stockBalances, total, page, limit);
  }

  async findOne(productId: string, locationId: string) {
    return this.prisma.stockBalance.findUnique({
      where: {
        productId_locationId: {
          productId,
          locationId,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            uom: {
              select: {
                symbol: true
              }
            },
            reorderLevel: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async getReorderAlerts() {
    // Get all stock balances with their products
    const stockBalances = await this.prisma.stockBalance.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            uom: {
              select: {
                symbol: true
              }
            },
            reorderLevel: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: [
        { product: { name: 'asc' } },
        { location: { name: 'asc' } },
      ],
    });

    // Filter balances where quantity is less than reorder level
    return stockBalances.filter(balance => balance.quantity < balance.product.reorderLevel);
  }

  async getTotalStock(productId: string) {
    const balances = await this.prisma.stockBalance.findMany({
      where: { productId },
    });

    return balances.reduce((total, balance) => total + balance.quantity, 0);
  }

  async getLocationStock(locationId: string) {
    console.log(`🔍 Fetching stock for location: ${locationId}`);
    
    const stockBalances = await this.prisma.stockBalance.findMany({
      where: { locationId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            uom: {
              select: {
                symbol: true
              }
            },
            reorderLevel: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { product: { name: 'asc' } },
    });

    console.log(`📊 Found ${stockBalances.length} stock balances for location ${locationId}:`, 
      stockBalances.map(sb => ({
        productName: sb.product.name,
        productSku: sb.product.sku,
        locationName: sb.location.name,
        locationType: sb.location.type,
        quantity: sb.quantity
      }))
    );

    return stockBalances;
  }
}
