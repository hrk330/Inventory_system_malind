import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockTransactionsService } from '../stock-transactions/stock-transactions.service';
import { AuditService } from '../audit/audit.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { CreatePurchaseReturnDto } from './dto/create-purchase-return.dto';
import { MarkReceivedDto } from './dto/mark-received.dto';
import { PurchaseQueryDto } from './dto/purchase-query.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse } from '../common/utils/pagination.helper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PurchaseService {
  private readonly logger = new Logger(PurchaseService.name);

  constructor(
    private prisma: PrismaService,
    private stockTransactionsService: StockTransactionsService,
    private auditService: AuditService,
  ) {}

  async createPurchaseOrder(createPurchaseOrderDto: CreatePurchaseOrderDto, userId: string) {
    this.logger.log(`Creating purchase order for supplier: ${createPurchaseOrderDto.supplierId}`);

    // Validate supplier exists
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: createPurchaseOrderDto.supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Validate products exist
    const productIds = createPurchaseOrderDto.items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Calculate total amount
    const totalAmount = createPurchaseOrderDto.items.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0
    );

    // Create purchase order in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create purchase order
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          orderNumber,
          supplierId: createPurchaseOrderDto.supplierId,
          referenceNo: createPurchaseOrderDto.referenceNo,
          orderDate: new Date(createPurchaseOrderDto.orderDate),
          expectedDate: createPurchaseOrderDto.expectedDate ? new Date(createPurchaseOrderDto.expectedDate) : null,
          totalAmount,
          remarks: createPurchaseOrderDto.remarks,
          createdBy: userId,
        },
      });

      // Create purchase items
      const purchaseItems = await Promise.all(
        createPurchaseOrderDto.items.map(async (item) => {
          return tx.purchaseItem.create({
            data: {
              purchaseOrderId: purchaseOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              costPrice: item.costPrice,
              retailPrice: item.retailPrice,
              expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
              totalPrice: item.totalPrice,
            },
          });
        })
      );

      return { purchaseOrder, purchaseItems };
    });

    // Log audit trail
    await this.auditService.log(
      userId,
      'PurchaseOrder',
      result.purchaseOrder.id,
      'CREATE',
      undefined,
      result.purchaseOrder,
    );

    this.logger.log(`Purchase order created successfully: ${result.purchaseOrder.id}`);

    return {
      ...result.purchaseOrder,
      items: result.purchaseItems,
      supplier,
    };
  }

  async findAll(queryDto: PurchaseQueryDto) {
    const { page, limit, search, supplierId, status, paymentStatus, startDate, endDate } = queryDto;
    
    const where: Prisma.PurchaseOrderWhereInput = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { referenceNo: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (status) {
      where.status = status as any;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus as any;
    }

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    const [purchaseOrders, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              contactPerson: true,
              email: true,
              phone: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  uom: {
                    select: {
                      symbol: true,
                    },
                  },
                },
              },
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return createPaginatedResponse(purchaseOrders, total, page, limit);
  }

  async findOne(id: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            product: {
              include: {
                uom: true,
                category: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        stockTransactions: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
            toLocation: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        returns: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    return purchaseOrder;
  }

  async update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto, userId: string) {
    const existingOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    // Prevent updates to received orders
    if (existingOrder.status === 'RECEIVED') {
      throw new BadRequestException('Cannot update received purchase order');
    }

    const updateData: any = { ...updatePurchaseOrderDto };
    if (updatePurchaseOrderDto.expectedDate) {
      updateData.expectedDate = new Date(updatePurchaseOrderDto.expectedDate);
    }

    const updatedOrder = await this.prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        items: {
          include: {
            product: {
              include: {
                uom: true,
              },
            },
          },
        },
      },
    });

    // Log audit trail
    await this.auditService.log(
      userId,
      'PurchaseOrder',
      id,
      'UPDATE',
      existingOrder,
      updatedOrder,
    );

    this.logger.log(`Purchase order updated: ${id}`);

    return updatedOrder;
  }

  async markAsReceived(id: string, markReceivedDto: MarkReceivedDto, userId: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        supplier: true,
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    if (purchaseOrder.status === 'RECEIVED') {
      throw new BadRequestException('Purchase order already marked as received');
    }

    // Get default location (warehouse)
    const defaultLocation = await this.prisma.location.findFirst({
      where: { type: 'WAREHOUSE' },
    });

    if (!defaultLocation) {
      throw new BadRequestException('No warehouse location found');
    }

    // Process received items
    const result = await this.prisma.$transaction(async (tx) => {
      // Update purchase order status
      const updatedOrder = await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: 'RECEIVED',
          remarks: markReceivedDto.remarks || purchaseOrder.remarks,
        },
      });

      // Create stock transactions and update stock balances
      const stockTransactions = [];
      
      for (const item of purchaseOrder.items) {
        const receivedQuantity = markReceivedDto.receivedItems?.find(
          ri => ri.itemId === item.id
        )?.receivedQuantity || item.quantity.toString();

        const quantity = parseFloat(receivedQuantity);

        // Create stock transaction
        const stockTransaction = await this.stockTransactionsService.create({
          productId: item.productId,
          toLocationId: defaultLocation.id,
          type: 'RECEIPT',
          quantity,
          referenceNo: purchaseOrder.orderNumber,
          remarks: `Purchase order receipt: ${purchaseOrder.orderNumber}`,
        }, userId);

        stockTransactions.push(stockTransaction);

        // Update product cost price if changed
        if (item.costPrice !== item.product.costPrice) {
          await tx.product.update({
            where: { id: item.productId },
            data: { costPrice: item.costPrice },
          });
        }
      }

      return { updatedOrder, stockTransactions };
    });

    // Log audit trail
    await this.auditService.log(
      userId,
      'PurchaseOrder',
      id,
      'UPDATE',
      { status: purchaseOrder.status },
      { status: 'RECEIVED' },
    );

    this.logger.log(`Purchase order marked as received: ${id}`);

    return result.updatedOrder;
  }

  async createPurchaseReturn(createPurchaseReturnDto: CreatePurchaseReturnDto, userId: string) {
    this.logger.log(`Creating purchase return for order: ${createPurchaseReturnDto.purchaseOrderId}`);

    // Validate purchase order exists
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id: createPurchaseReturnDto.purchaseOrderId },
      include: { supplier: true },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    // Generate return number
    const returnNumber = await this.generateReturnNumber();

    // Calculate total amount
    const totalAmount = createPurchaseReturnDto.items.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0
    );

    // Create purchase return in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create purchase return
      const purchaseReturn = await tx.purchaseReturn.create({
        data: {
          returnNumber,
          purchaseOrderId: createPurchaseReturnDto.purchaseOrderId,
          supplierId: createPurchaseReturnDto.supplierId,
          reason: createPurchaseReturnDto.reason,
          totalAmount,
          remarks: createPurchaseReturnDto.remarks,
          createdBy: userId,
        },
      });

      // Create return items
      const returnItems = await Promise.all(
        createPurchaseReturnDto.items.map(async (item) => {
          return tx.purchaseReturnItem.create({
            data: {
              returnId: purchaseReturn.id,
              productId: item.productId,
              quantity: item.quantity,
              costPrice: item.costPrice,
              totalPrice: item.totalPrice,
              reason: item.reason,
            },
          });
        })
      );

      return { purchaseReturn, returnItems };
    });

    // Log audit trail
    await this.auditService.log(
      userId,
      'PurchaseReturn',
      result.purchaseReturn.id,
      'CREATE',
      undefined,
      result.purchaseReturn,
    );

    this.logger.log(`Purchase return created successfully: ${result.purchaseReturn.id}`);

    return {
      ...result.purchaseReturn,
      items: result.returnItems,
      purchaseOrder,
    };
  }

  async remove(id: string, userId: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    if (purchaseOrder.status === 'RECEIVED') {
      throw new BadRequestException('Cannot delete received purchase order');
    }

    await this.prisma.purchaseOrder.delete({
      where: { id },
    });

    // Log audit trail
    await this.auditService.log(
      userId,
      'PurchaseOrder',
      id,
      'DELETE',
      purchaseOrder,
      undefined,
    );

    this.logger.log(`Purchase order deleted: ${id}`);

    return { message: 'Purchase order deleted successfully' };
  }

  private async generateOrderNumber(): Promise<string> {
    const count = await this.prisma.purchaseOrder.count();
    return `PO-${String(count + 1).padStart(6, '0')}`;
  }

  async updatePayment(id: string, updatePaymentDto: any, userId: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { supplier: true },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    const { amount, paymentStatus, paymentReference, paymentNotes } = updatePaymentDto;
    const currentAmountPaid = Number(purchaseOrder.amountPaid);
    const newAmountPaid = currentAmountPaid + amount;
    const totalAmount = Number(purchaseOrder.totalAmount);

    // Validate payment amount
    if (newAmountPaid > totalAmount) {
      throw new BadRequestException('Payment amount exceeds total amount');
    }

    // Determine payment status if not provided
    let finalPaymentStatus = paymentStatus;
    if (!finalPaymentStatus) {
      if (newAmountPaid >= totalAmount) {
        finalPaymentStatus = 'PAID';
      } else if (newAmountPaid > 0) {
        finalPaymentStatus = 'PARTIAL';
      } else {
        finalPaymentStatus = 'PENDING';
      }
    }

    const updatedPurchaseOrder = await this.prisma.$transaction(async (tx) => {
      // Create payment record
      await tx.purchasePayment.create({
        data: {
          purchaseOrderId: id,
          amount: amount,
          paymentMethod: updatePaymentDto.paymentMethod || 'CASH',
          referenceNumber: updatePaymentDto.paymentReference,
          notes: updatePaymentDto.paymentNotes,
          processedBy: userId,
        },
      });

      // Update purchase order
      return await tx.purchaseOrder.update({
        where: { id },
        data: {
          amountPaid: newAmountPaid,
          paymentStatus: finalPaymentStatus,
          updatedAt: new Date(),
        },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              contactPerson: true,
              email: true,
              phone: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
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
    });

    // Log audit trail
    await this.auditService.log(
      userId,
      'PurchaseOrder',
      id,
      'UPDATE_PAYMENT',
      {
        previousAmountPaid: currentAmountPaid,
        paymentAmount: amount,
        newAmountPaid: newAmountPaid,
        paymentStatus: finalPaymentStatus,
        paymentReference,
        paymentNotes,
      },
      updatedPurchaseOrder,
    );

    this.logger.log(`Payment updated for purchase order ${id}: ${amount} (Total paid: ${newAmountPaid})`);

    return updatedPurchaseOrder;
  }

  async getPaymentHistory(id: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        amountPaid: true,
        paymentStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    // For now, we'll return the current payment info
    // In a full implementation, you might want to track individual payment transactions
    return {
      purchaseOrderId: purchaseOrder.id,
      orderNumber: purchaseOrder.orderNumber,
      totalAmount: purchaseOrder.totalAmount,
      amountPaid: purchaseOrder.amountPaid,
      remainingAmount: Number(purchaseOrder.totalAmount) - Number(purchaseOrder.amountPaid),
      paymentStatus: purchaseOrder.paymentStatus,
      lastUpdated: purchaseOrder.updatedAt,
    };
  }

  async findAllReturns(queryDto: any) {
    try {
      this.logger.log('Finding all purchase returns with query:', queryDto);

      const { page = 1, limit = 20, search, status, supplierId, startDate, endDate } = queryDto;
      const pageNum = parseInt(String(page), 10);
      const limitNum = parseInt(String(limit), 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      if (search) {
        where.OR = [
          { returnNumber: { contains: search, mode: 'insensitive' } },
          { remarks: { contains: search, mode: 'insensitive' } },
          { purchaseOrder: { orderNumber: { contains: search, mode: 'insensitive' } } },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (supplierId) {
        where.purchaseOrder = { supplierId };
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      this.logger.log('Where clause:', JSON.stringify(where, null, 2));

      const [returns, total] = await Promise.all([
        this.prisma.purchaseReturn.findMany({
          where,
          include: {
            purchaseOrder: {
              include: {
                supplier: {
                  select: {
                    id: true,
                    name: true,
                    contactPerson: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
            supplier: {
              select: {
                id: true,
                name: true,
                contactPerson: true,
                email: true,
                phone: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                  },
                },
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
          take: limitNum,
        }),
        this.prisma.purchaseReturn.count({ where }),
      ]);

      this.logger.log(`Found ${returns.length} returns out of ${total} total`);

      return {
        data: returns,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      };
    } catch (error) {
      this.logger.error('Error in findAllReturns:', error);
      throw error;
    }
  }

  async approvePurchaseReturn(returnId: string, userId: string) {
    try {
      this.logger.log(`Approving purchase return ${returnId} by user ${userId}`);

      // Check if return exists and is in PENDING status
      const purchaseReturn = await this.prisma.purchaseReturn.findUnique({
        where: { id: returnId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!purchaseReturn) {
        throw new Error('Purchase return not found');
      }

      if (purchaseReturn.status !== 'PENDING') {
        throw new Error(`Cannot approve return with status ${purchaseReturn.status}. Only PENDING returns can be approved.`);
      }

      // Update return status to APPROVED
      const updatedReturn = await this.prisma.purchaseReturn.update({
        where: { id: returnId },
        data: {
          status: 'APPROVED',
          updatedAt: new Date(),
        },
        include: {
          purchaseOrder: {
            include: {
              supplier: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
          creator: true,
        },
      });

      this.logger.log(`Purchase return ${returnId} approved successfully`);

      return {
        message: 'Purchase return approved successfully',
        data: updatedReturn,
      };
    } catch (error) {
      this.logger.error(`Error approving purchase return ${returnId}:`, error);
      throw error;
    }
  }

  async rejectPurchaseReturn(returnId: string, userId: string) {
    try {
      this.logger.log(`Rejecting purchase return ${returnId} by user ${userId}`);

      // Check if return exists and is in PENDING status
      const purchaseReturn = await this.prisma.purchaseReturn.findUnique({
        where: { id: returnId },
      });

      if (!purchaseReturn) {
        throw new Error('Purchase return not found');
      }

      if (purchaseReturn.status !== 'PENDING') {
        throw new Error(`Cannot reject return with status ${purchaseReturn.status}. Only PENDING returns can be rejected.`);
      }

      // Update return status to REJECTED
      const updatedReturn = await this.prisma.purchaseReturn.update({
        where: { id: returnId },
        data: {
          status: 'REJECTED',
          updatedAt: new Date(),
        },
        include: {
          purchaseOrder: {
            include: {
              supplier: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
          creator: true,
        },
      });

      this.logger.log(`Purchase return ${returnId} rejected successfully`);

      return {
        message: 'Purchase return rejected successfully',
        data: updatedReturn,
      };
    } catch (error) {
      this.logger.error(`Error rejecting purchase return ${returnId}:`, error);
      throw error;
    }
  }

  async completePurchaseReturn(returnId: string, userId: string) {
    try {
      this.logger.log(`Completing purchase return ${returnId} by user ${userId}`);

      // Check if return exists and is in APPROVED status
      const purchaseReturn = await this.prisma.purchaseReturn.findUnique({
        where: { id: returnId },
      });

      if (!purchaseReturn) {
        throw new Error('Purchase return not found');
      }

      if (purchaseReturn.status !== 'APPROVED') {
        throw new Error(`Cannot complete return with status ${purchaseReturn.status}. Only APPROVED returns can be completed.`);
      }

      // Update return status to COMPLETED
      const updatedReturn = await this.prisma.purchaseReturn.update({
        where: { id: returnId },
        data: {
          status: 'COMPLETED',
          updatedAt: new Date(),
        },
        include: {
          purchaseOrder: {
            include: {
              supplier: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
          creator: true,
        },
      });

      this.logger.log(`Purchase return ${returnId} completed successfully`);

      return {
        message: 'Purchase return marked as completed successfully',
        data: updatedReturn,
      };
    } catch (error) {
      this.logger.error(`Error completing purchase return ${returnId}:`, error);
      throw error;
    }
  }

  private async generateReturnNumber(): Promise<string> {
    const count = await this.prisma.purchaseReturn.count();
    return `PR-${String(count + 1).padStart(6, '0')}`;
  }
}
