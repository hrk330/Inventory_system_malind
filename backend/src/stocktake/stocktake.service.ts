import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockTransactionsService } from '../stock-transactions/stock-transactions.service';
import { CreateStocktakeDto } from './dto/create-stocktake.dto';

@Injectable()
export class StocktakeService {
  constructor(
    private prisma: PrismaService,
    private stockTransactionsService: StockTransactionsService,
  ) {}

  async create(createStocktakeDto: CreateStocktakeDto, userId: string) {
    console.log('StocktakeService.create called with:', createStocktakeDto);
    console.log('User ID:', userId);
    const { productId, locationId, countedQuantity, remarks } = createStocktakeDto;

    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Validate location exists
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Get current system quantity
    const currentBalance = await this.prisma.stockBalance.findUnique({
      where: {
        productId_locationId: {
          productId,
          locationId,
        },
      },
    });

    const systemQuantity = currentBalance ? currentBalance.quantity : 0;
    const adjustment = countedQuantity - systemQuantity;

    // Validate counted quantity
    if (countedQuantity < 0) {
      throw new BadRequestException('Counted quantity cannot be negative');
    }

    // Execute stocktake in a database transaction
    return this.prisma.$transaction(async (tx) => {
      // Create stocktake record
      const stocktake = await tx.stocktake.create({
        data: {
          productId,
          locationId,
          countedQuantity,
          systemQuantity,
          adjustment,
          performedBy: userId,
        },
      });

      // If there's an adjustment, create a stock transaction
      if (adjustment !== 0) {
        const transactionRemarks = remarks 
          ? `Stocktake adjustment - System: ${systemQuantity}, Counted: ${countedQuantity}. Notes: ${remarks}`
          : `Stocktake adjustment - System: ${systemQuantity}, Counted: ${countedQuantity}`;
          
        await this.stockTransactionsService.create(
          {
            productId,
            fromLocationId: locationId,
            type: 'ADJUSTMENT',
            quantity: adjustment,
            referenceNo: `ST-${stocktake.id.slice(-8)}`,
            remarks: transactionRemarks,
          },
          userId,
        );
      }

      return stocktake;
    });
  }

  async findAll(productId?: string, locationId?: string) {
    const where: any = {};
    
    if (productId) {
      where.productId = productId;
    }
    
    if (locationId) {
      where.locationId = locationId;
    }

    return this.prisma.stocktake.findMany({
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
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        performer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const stocktake = await this.prisma.stocktake.findUnique({
      where: { id },
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
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        performer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!stocktake) {
      throw new NotFoundException('Stocktake not found');
    }

    return stocktake;
  }

  async getStocktakeSummary(locationId?: string) {
    const where: any = {};
    
    if (locationId) {
      where.locationId = locationId;
    }

    const stocktakes = await this.prisma.stocktake.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      totalCount: stocktakes.length,
      adjustments: stocktakes.filter(s => s.adjustment !== 0).length,
      totalAdjustment: stocktakes.reduce((sum, s) => sum + s.adjustment, 0),
      recentStocktakes: stocktakes.slice(0, 10),
    };

    return summary;
  }
}
