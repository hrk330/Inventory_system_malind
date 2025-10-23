import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
import { AuditService } from '../audit/audit.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, getPaginationParams } from '../common/utils/pagination.helper';

@Injectable()
export class StockTransactionsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(createStockTransactionDto: CreateStockTransactionDto, userId: string) {
    const { productId, fromLocationId, toLocationId, type, quantity, referenceNo, remarks, saleId } = createStockTransactionDto;

    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Validate locations exist
    if (fromLocationId) {
      const fromLocation = await this.prisma.location.findUnique({
        where: { id: fromLocationId },
      });
      if (!fromLocation) {
        throw new NotFoundException('From location not found');
      }
    }

    if (toLocationId) {
      const toLocation = await this.prisma.location.findUnique({
        where: { id: toLocationId },
      });
      if (!toLocation) {
        throw new NotFoundException('To location not found');
      }
    }

    // Validate transaction type and locations
    this.validateTransactionType(type, fromLocationId, toLocationId);

    // Validate quantity (allow negative for ADJUSTMENT type)
    if (type !== 'ADJUSTMENT' && quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }
    
    if (type === 'ADJUSTMENT' && quantity === 0) {
      throw new BadRequestException('Adjustment quantity cannot be zero');
    }

    // Check sufficient stock for ISSUE and TRANSFER
    if (type === 'ISSUE' || type === 'TRANSFER') {
      const currentBalance = await this.getCurrentBalance(productId, fromLocationId);
      if (currentBalance < quantity) {
        throw new BadRequestException('Insufficient stock');
      }
    }

    // Generate reference number if not provided
    const finalReferenceNo = referenceNo || await this.generateReferenceNumber(type);

    // Execute transaction in a database transaction
    return this.prisma.$transaction(async (tx) => {
      // Create the transaction record
      const transaction = await tx.stockTransaction.create({
        data: {
          productId,
          fromLocationId,
          toLocationId,
          type,
          quantity,
          referenceNo: finalReferenceNo,
          remarks,
          saleId,
          createdBy: userId,
        },
      });

      // Update stock balances based on transaction type
      await this.updateStockBalances(tx, productId, fromLocationId, toLocationId, type, quantity);

      // Log audit trail
      try {
        await this.auditService.log(
          userId,
          'StockTransaction',
          transaction.id,
          'CREATE',
          null,
          {
            productId: transaction.productId,
            fromLocationId: transaction.fromLocationId,
            toLocationId: transaction.toLocationId,
            type: transaction.type,
            quantity: transaction.quantity,
            referenceNo: transaction.referenceNo,
            remarks: transaction.remarks,
          }
        );
      } catch (auditError) {
        console.warn(`Failed to log audit trail for stock transaction: ${auditError.message}`);
      }

      return transaction;
    });
  }

  async findAll(
    paginationDto: PaginationDto,
    productId?: string,
    locationId?: string,
    type?: string
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);
    
    const where: any = {};
    
    if (productId) {
      where.productId = productId;
    }
    
    if (locationId) {
      where.OR = [
        { fromLocationId: locationId },
        { toLocationId: locationId },
      ];
    }
    
    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.stockTransaction.findMany({
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
          fromLocation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          toLocation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.stockTransaction.count({ where }),
    ]);

    return createPaginatedResponse(transactions, total, page, limit);
  }

  async findOne(id: string) {
    const transaction = await this.prisma.stockTransaction.findUnique({
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
        fromLocation: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        toLocation: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  private validateTransactionType(type: string, fromLocationId?: string, toLocationId?: string) {
    switch (type) {
      case 'RECEIPT':
        if (!toLocationId) {
          throw new BadRequestException('To location is required for RECEIPT transaction');
        }
        if (fromLocationId) {
          throw new BadRequestException('From location should not be specified for RECEIPT transaction');
        }
        break;
      case 'ISSUE':
        if (!fromLocationId) {
          throw new BadRequestException('From location is required for ISSUE transaction');
        }
        if (toLocationId) {
          throw new BadRequestException('To location should not be specified for ISSUE transaction');
        }
        break;
      case 'TRANSFER':
        if (!fromLocationId || !toLocationId) {
          throw new BadRequestException('Both from and to locations are required for TRANSFER transaction');
        }
        if (fromLocationId === toLocationId) {
          throw new BadRequestException('From and to locations cannot be the same');
        }
        break;
      case 'ADJUSTMENT':
        if (!fromLocationId) {
          throw new BadRequestException('From location is required for ADJUSTMENT transaction');
        }
        if (toLocationId) {
          throw new BadRequestException('To location should not be specified for ADJUSTMENT transaction');
        }
        break;
      default:
        throw new BadRequestException('Invalid transaction type');
    }
  }

  private async getCurrentBalance(productId: string, locationId: string): Promise<number> {
    const balance = await this.prisma.stockBalance.findUnique({
      where: {
        productId_locationId: {
          productId,
          locationId,
        },
      },
    });

    return balance ? balance.quantity : 0;
  }

  private async updateStockBalances(
    tx: any,
    productId: string,
    fromLocationId: string | undefined,
    toLocationId: string | undefined,
    type: string,
    quantity: number
  ) {
    switch (type) {
      case 'RECEIPT':
        // Add to destination location
        await this.upsertStockBalance(tx, productId, toLocationId!, quantity);
        break;
      case 'ISSUE':
        // Subtract from source location
        await this.upsertStockBalance(tx, productId, fromLocationId!, -quantity);
        break;
      case 'TRANSFER':
        // Subtract from source, add to destination
        await this.upsertStockBalance(tx, productId, fromLocationId!, -quantity);
        await this.upsertStockBalance(tx, productId, toLocationId!, quantity);
        break;
      case 'ADJUSTMENT':
        // Adjust the quantity (can be positive or negative)
        await this.upsertStockBalance(tx, productId, fromLocationId!, quantity);
        break;
    }
  }

  private async upsertStockBalance(tx: any, productId: string, locationId: string, quantityChange: number) {
    const existingBalance = await tx.stockBalance.findUnique({
      where: {
        productId_locationId: {
          productId,
          locationId,
        },
      },
    });

    const newQuantity = (existingBalance?.quantity || 0) + quantityChange;

    // Allow negative quantities for stocktake adjustments
    // For other transaction types, prevent negative stock
    if (newQuantity < 0) {
      console.log(`Stock adjustment: ${quantityChange}, Current: ${existingBalance?.quantity || 0}, New: ${newQuantity}`);
      // For now, allow negative quantities for adjustments
      // In a real system, you might want to handle this differently
    }

    if (existingBalance) {
      await tx.stockBalance.update({
        where: {
          productId_locationId: {
            productId,
            locationId,
          },
        },
        data: {
          quantity: newQuantity,
          lastUpdated: new Date(),
        },
      });
    } else {
      await tx.stockBalance.create({
        data: {
          productId,
          locationId,
          quantity: newQuantity,
          lastUpdated: new Date(),
        },
      });
    }
  }

  private async generateReferenceNumber(type: string): Promise<string> {
    const prefix = type.charAt(0);
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }
}
