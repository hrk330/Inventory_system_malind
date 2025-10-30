import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockTransactionsService } from '../stock-transactions/stock-transactions.service';
import { AuditService } from '../audit/audit.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { RefundSaleDto } from './dto/refund-sale.dto';
import { SaleFiltersDto } from './dto/sale-filters.dto';
import { UpdateSaleStatusDto } from './dto/update-sale-status.dto';
import { createPaginatedResponse } from '../common/utils/pagination.helper';
import { SaleStatus, PaymentStatus, SaleType, ItemType, DiscountType } from '@prisma/client';

@Injectable()
export class PosService {
  constructor(
    private prisma: PrismaService,
    private stockTransactionsService: StockTransactionsService,
    private auditService: AuditService,
  ) {}

  async createSale(createSaleDto: CreateSaleDto, userId: string) {
    const { items, payments, ...saleData } = createSaleDto;

    // Validate location exists
    const location = await this.prisma.location.findUnique({
      where: { id: saleData.locationId },
    });
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Validate customer if provided
    if (saleData.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: saleData.customerId },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    // Validate products and stock for PRODUCT items
    await this.validateStock(items, saleData.locationId);

    // Calculate totals
    const calculations = this.calculateTotals(
      items,
      saleData.taxRate || 0,
      saleData.discountType,
      saleData.discountValue || 0,
    );

    // Create sale in transaction with retry for unique constraint on saleNumber
    let lastError: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      // Generate sale number per attempt
      const saleNumber = await this.generateSaleNumber();

      try {
        const result = await this.prisma.$transaction(async (tx) => {
      // Create sale record - filter out non-database fields
      const { discountValue, isCreditSale: creditSaleFlag, amountPaid: paidAmount, totalAmount: saleTotal, ...saleDataWithoutExtra } = saleData;
      const sale = await tx.sale.create({
        data: {
          ...saleDataWithoutExtra,
          saleNumber,
          subtotal: calculations.subtotal,
          taxAmount: calculations.taxAmount,
          discountRate: discountValue, // Map discountValue to discountRate
          discountAmount: calculations.discountAmount,
          totalAmount: calculations.totalAmount,
          amountPaid: 0,
          changeGiven: 0,
          paymentStatus: PaymentStatus.PENDING,
          status: SaleStatus.DRAFT,
          createdBy: userId,
        },
      });

      // Create sale items
      const saleItems = await Promise.all(
        items.map(async (item) => {
          const itemCalculations = this.calculateItemTotals(item);
          return tx.saleItem.create({
            data: {
              ...item,
              ...itemCalculations,
              saleId: sale.id,
            },
          });
        }),
      );

      // Create stock transactions for PRODUCT items
      await this.createStockTransactions(sale, items, saleData.locationId, userId, tx);

      // Create payments if provided
      let totalPaid = 0;
      if (payments && payments.length > 0) {
        const paymentRecords = await Promise.all(
          payments.map((payment) =>
            tx.payment.create({
              data: {
                ...payment,
                saleId: sale.id,
                processedBy: userId,
              },
            }),
          ),
        );
        totalPaid = paymentRecords.reduce((sum, payment) => sum + Number(payment.amount), 0);
      }

      // Determine sale status based on payment and credit sale flag
      const isCreditSale = creditSaleFlag || false;
      const isFullyPaid = totalPaid >= Number(sale.totalAmount);
      const isPartiallyPaid = totalPaid > 0 && totalPaid < Number(sale.totalAmount);
      
      let finalStatus: SaleStatus;
      let finalPaymentStatus: PaymentStatus;
      
      if (isCreditSale) {
        // Credit sale - customer will pay later
        finalStatus = SaleStatus.CREDIT;
        finalPaymentStatus = isFullyPaid ? PaymentStatus.PAID : 
                           isPartiallyPaid ? PaymentStatus.PARTIAL : PaymentStatus.PENDING;
      } else if (isFullyPaid) {
        // Fully paid
        finalStatus = SaleStatus.COMPLETED;
        finalPaymentStatus = PaymentStatus.PAID;
      } else if (isPartiallyPaid) {
        // Partially paid
        finalStatus = SaleStatus.PARTIAL;
        finalPaymentStatus = PaymentStatus.PARTIAL;
      } else {
        // No payment
        finalStatus = SaleStatus.DRAFT;
        finalPaymentStatus = PaymentStatus.PENDING;
      }

      // Calculate amount paid (capped at total amount to prevent change from affecting customer balance)
      const actualAmountPaid = Math.min(totalPaid, Number(sale.totalAmount));
      const changeGiven = Math.max(0, totalPaid - Number(sale.totalAmount));

      // Update sale with payment info
      const updatedSale = await tx.sale.update({
        where: { id: sale.id },
        data: {
          amountPaid: actualAmountPaid, // Cap at total amount - change doesn't affect customer balance
          changeGiven: changeGiven,
          paymentStatus: finalPaymentStatus,
          status: finalStatus,
          completedAt: (finalStatus === SaleStatus.COMPLETED || finalStatus === SaleStatus.CREDIT) ? new Date() : null,
        },
      });

      // Note: Customer balance update moved outside transaction to prevent timeout

          return { sale, updatedSale, finalStatus, totalPaid, actualAmountPaid };
        });

        // Success: proceed with post-transaction updates and return
        // Update customer balance after transaction completes to avoid timeout
        if (saleData.customerId) {
          try {
            const remainingBalance = Number(result.updatedSale.totalAmount) - result.actualAmountPaid;
            
            if (remainingBalance > 0) {
              await this.prisma.customer.update({
                where: { id: saleData.customerId },
                data: {
                  balance: { increment: remainingBalance },
                  totalPurchases: { increment: Number(result.updatedSale.totalAmount) },
                  lastPurchaseDate: new Date()
                }
              });
            } else if (remainingBalance < 0) {
              await this.prisma.customer.update({
                where: { id: saleData.customerId },
                data: {
                  balance: { increment: remainingBalance },
                  totalPurchases: { increment: Number(result.updatedSale.totalAmount) },
                  lastPurchaseDate: new Date()
                }
              });
            } else {
              await this.prisma.customer.update({
                where: { id: saleData.customerId },
                data: {
                  totalPurchases: { increment: Number(result.updatedSale.totalAmount) },
                  lastPurchaseDate: new Date()
                }
              });
            }
          } catch (error) {
            console.error('Error updating customer balance:', error);
            // Don't fail the sale if customer balance update fails
          }
        }

        // Log audit trail after transaction completes to avoid timeout
        try {
          await this.auditService.log(
            userId,
            'Sale',
            result.sale.id,
            'CREATE',
            null,
            {
              saleNumber: result.sale.saleNumber,
              customerId: saleData.customerId,
              locationId: saleData.locationId,
              totalAmount: result.sale.totalAmount,
              status: result.updatedSale.status,
            },
          );
        } catch (auditError) {
          console.warn(`Failed to log audit trail for sale: ${auditError.message}`);
        }

        return result.updatedSale;
      } catch (e: any) {
        lastError = e;
        // Retry on unique constraint violation for saleNumber
        if (e && e.code === 'P2002') {
          continue;
        }
        throw e;
      }
    }
    // If we exhaust retries
    throw lastError;
  }

  async getSales(filters: SaleFiltersDto) {
    const { page = 1, limit = 10, ...filterParams } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Apply filters
    if (filterParams.startDate || filterParams.endDate) {
      where.saleDate = {};
      if (filterParams.startDate) {
        where.saleDate.gte = new Date(filterParams.startDate);
      }
      if (filterParams.endDate) {
        where.saleDate.lte = new Date(filterParams.endDate);
      }
    }

    if (filterParams.locationId) where.locationId = filterParams.locationId;
    if (filterParams.customerId) where.customerId = filterParams.customerId;
    if (filterParams.createdBy) where.createdBy = filterParams.createdBy;
    
    // Handle single status or multiple statuses
    if (filterParams.status) {
      where.status = filterParams.status;
    } else if (filterParams.statuses) {
      const statusArray = filterParams.statuses.split(',').map(s => s.trim());
      where.status = { in: statusArray };
    }
    
    if (filterParams.paymentStatus) where.paymentStatus = filterParams.paymentStatus;
    if (filterParams.saleType) where.saleType = filterParams.saleType;
    if (filterParams.saleNumber) where.saleNumber = { contains: filterParams.saleNumber };

    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { saleDate: 'desc' },
        include: {
          customer: { select: { id: true, name: true, email: true, balance: true } },
          location: { select: { id: true, name: true } },
          creator: { select: { id: true, name: true, email: true } },
          payments: {
            select: {
              id: true,
              amount: true,
              paymentMethod: true,
              referenceNumber: true,
              paymentDate: true,
              notes: true,
            },
            orderBy: { paymentDate: 'desc' }
          },
          _count: { select: { saleItems: true, payments: true } },
        },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return createPaginatedResponse(sales, total, page, limit);
  }

  async getSalesStats(filters: SaleFiltersDto) {
    const where: any = {};

    // Apply same filters as getSales
    if (filters.startDate || filters.endDate) {
      where.saleDate = {};
      if (filters.startDate) {
        where.saleDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.saleDate.lte = new Date(filters.endDate);
      }
    }

    if (filters.locationId) where.locationId = filters.locationId;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.createdBy) where.createdBy = filters.createdBy;
    if (filters.status) where.status = filters.status;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
    if (filters.saleType) where.saleType = filters.saleType;
    if (filters.saleNumber) where.saleNumber = { contains: filters.saleNumber };

    // Get aggregated statistics
    const [totalSales, totalAmount, pendingPayments] = await Promise.all([
      this.prisma.sale.count({ where }),
      this.prisma.sale.aggregate({
        where,
        _sum: { totalAmount: true },
      }),
      this.prisma.sale.count({
        where: { ...where, paymentStatus: 'PENDING' },
      }),
    ]);

    const totalAmountValue = Number(totalAmount._sum.totalAmount || 0);
    const averageValue = totalSales > 0 ? totalAmountValue / totalSales : 0;

    return {
      totalSales,
      totalAmount: totalAmountValue,
      averageValue,
      pendingPayments,
    };
  }

  async getSaleById(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        location: true,
        creator: { select: { id: true, name: true, email: true } },
        canceller: { select: { id: true, name: true, email: true } },
        saleItems: {
          include: { product: true },
        },
        payments: {
          include: { processor: { select: { id: true, name: true, email: true } } },
        },
        receipts: {
          include: { generator: { select: { id: true, name: true, email: true } } },
        },
        stockTransactions: true,
        refunds: {
          include: {
            processor: { select: { id: true, name: true, email: true } },
            approver: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  async updateSaleStatus(id: string, updateSaleStatusDto: UpdateSaleStatusDto, userId: string) {
    const sale = await this.getSaleById(id);

    // Validate status transitions
    this.validateStatusTransition(sale.status, updateSaleStatusDto.status);

    return this.prisma.$transaction(async (tx) => {
      const updatedSale = await tx.sale.update({
        where: { id },
        data: {
          status: updateSaleStatusDto.status,
          cancelledAt: updateSaleStatusDto.status === SaleStatus.CANCELLED ? new Date() : null,
          cancelledBy: updateSaleStatusDto.status === SaleStatus.CANCELLED ? userId : null,
          cancellationReason: updateSaleStatusDto.reason,
          completedAt: updateSaleStatusDto.status === SaleStatus.COMPLETED ? new Date() : sale.completedAt,
        },
        include: {
          customer: true,
          location: true,
          creator: { select: { id: true, name: true, email: true } },
          saleItems: { include: { product: true } },
          payments: true,
        },
      });

      // If cancelling a completed sale, reverse stock transactions
      if (sale.status === SaleStatus.COMPLETED && updateSaleStatusDto.status === SaleStatus.CANCELLED) {
        await this.reverseStockTransactions(id, userId, tx);
      }

      // Log audit trail
      await this.auditService.log(
        userId,
        'Sale',
        id,
        'UPDATE',
        { status: sale.status },
        { status: updateSaleStatusDto.status, reason: updateSaleStatusDto.reason },
      );

      return updatedSale;
    });
  }

  async addPayment(saleId: string, addPaymentDto: AddPaymentDto, userId: string) {
    const sale = await this.getSaleById(saleId);

    if (sale.status === SaleStatus.CANCELLED || sale.status === SaleStatus.REFUNDED) {
      throw new BadRequestException('Cannot add payment to cancelled or refunded sale');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create payment
      const payment = await tx.payment.create({
        data: {
          ...addPaymentDto,
          saleId,
          processedBy: userId,
        },
      });

      // Create customer payment record for ledger tracking
      if (sale.customerId) {
        await tx.customerPayment.create({
          data: {
            saleId,
            amount: addPaymentDto.amount,
            paymentMethod: addPaymentDto.paymentMethod,
            referenceNumber: addPaymentDto.referenceNumber,
            notes: addPaymentDto.notes,
            processedBy: userId,
          },
        });
      }

      // Calculate new totals
      const allPayments = await tx.payment.findMany({
        where: { saleId },
      });
      const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);

      // Determine new sale status
      const isFullyPaid = totalPaid >= Number(sale.totalAmount);
      const isPartiallyPaid = totalPaid > 0 && totalPaid < Number(sale.totalAmount);
      
      let newStatus: SaleStatus;
      let newPaymentStatus: PaymentStatus;
      
      if (isFullyPaid) {
        newStatus = SaleStatus.COMPLETED;
        newPaymentStatus = PaymentStatus.PAID;
      } else if (isPartiallyPaid) {
        newStatus = SaleStatus.PARTIAL;
        newPaymentStatus = PaymentStatus.PARTIAL;
      } else {
        newStatus = sale.status;
        newPaymentStatus = PaymentStatus.PENDING;
      }

      // Calculate amount paid (capped at total amount to prevent change from affecting customer balance)
      const actualAmountPaid = Math.min(totalPaid, Number(sale.totalAmount));
      const changeGiven = Math.max(0, totalPaid - Number(sale.totalAmount));

      // Update sale
      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: {
          amountPaid: actualAmountPaid, // Cap at total amount - change doesn't affect customer balance
          changeGiven: changeGiven,
          paymentStatus: newPaymentStatus,
          status: newStatus,
          completedAt: isFullyPaid ? new Date() : sale.completedAt,
        },
        include: {
          customer: true,
          location: true,
          creator: { select: { id: true, name: true, email: true } },
          saleItems: { include: { product: true } },
          payments: true,
        },
      });

      // Update customer balance
      if (sale.customerId) {
        const previousAmountPaid = Number(sale.amountPaid);
        const paymentAmount = Number(addPaymentDto.amount);
        
        // Calculate the effective payment amount (capped at remaining balance)
        const remainingBalance = Number(sale.totalAmount) - previousAmountPaid;
        const effectivePaymentAmount = Math.min(paymentAmount, remainingBalance);
        
        // Reduce customer balance by the effective payment amount only
        await tx.customer.update({
          where: { id: sale.customerId },
          data: {
            balance: {
              decrement: effectivePaymentAmount
            }
          }
        });

        // Update customer stats if fully paid
        if (isFullyPaid && sale.status !== SaleStatus.COMPLETED) {
          await this.updateCustomerStats(sale.customerId, Number(sale.totalAmount), tx);
        }
      }

      // Log audit trail
      await this.auditService.log(
        userId,
        'Payment',
        payment.id,
        'CREATE',
        null,
        {
          saleId,
          amount: payment.amount,
          method: payment.paymentMethod,
          totalPaid,
        },
      );

      return updatedSale;
    });
  }

  async processRefund(saleId: string, refundSaleDto: RefundSaleDto, userId: string, userRole: string) {
    // Check if user has ADMIN role
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can process refunds');
    }

    const sale = await this.getSaleById(saleId);

    if (sale.status !== SaleStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed sales');
    }

    const refundAmount = refundSaleDto.refundType === 'FULL' 
      ? Number(sale.totalAmount) 
      : refundSaleDto.refundAmount!;

    if (refundAmount > Number(sale.totalAmount)) {
      throw new BadRequestException('Refund amount cannot exceed sale total');
    }

    // Generate refund number
    const refundNumber = await this.generateRefundNumber();

    return this.prisma.$transaction(async (tx) => {
      // Create refund record
      const refund = await tx.saleRefund.create({
        data: {
          originalSaleId: saleId,
          refundNumber,
          refundType: refundSaleDto.refundType,
          refundAmount,
          refundMethod: refundSaleDto.refundMethod,
          reason: refundSaleDto.reason,
          processedBy: userId,
          approvedBy: userId, // Auto-approve for now
          notes: refundSaleDto.notes,
        },
      });

      // Update original sale
      await tx.sale.update({
        where: { id: saleId },
        data: {
          status: SaleStatus.REFUNDED,
          paymentStatus: PaymentStatus.REFUNDED,
        },
      });

      // Create reverse stock transactions
      await this.reverseStockTransactions(saleId, userId, tx);

      // Create refund payment record (negative amount)
      await tx.payment.create({
        data: {
          saleId,
          paymentMethod: refundSaleDto.refundMethod,
          amount: -refundAmount,
          referenceNumber: refundNumber,
          processedBy: userId,
          notes: `Refund: ${refundSaleDto.reason}`,
        },
      });

      // Log audit trail
      await this.auditService.log(
        userId,
        'SaleRefund',
        refund.id,
        'CREATE',
        null,
        {
          originalSaleId: saleId,
          refundAmount,
          reason: refundSaleDto.reason,
        },
      );

      return refund;
    });
  }

  async getDailySummary(locationId?: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const where: any = {
      saleDate: { gte: startOfDay, lte: endOfDay },
      status: SaleStatus.COMPLETED,
    };

    if (locationId) {
      where.locationId = locationId;
    }

    const [
      totalSales,
      transactionCount,
      paymentMethods,
      topProducts,
      salesByUser,
    ] = await Promise.all([
      this.prisma.sale.aggregate({
        where,
        _sum: { totalAmount: true },
        _avg: { totalAmount: true },
      }),
      this.prisma.sale.count({ where }),
      this.prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: { sale: where },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.saleItem.groupBy({
        by: ['itemName'],
        where: { sale: where },
        _sum: { quantity: true, lineTotal: true },
        _count: { id: true },
        orderBy: { _sum: { lineTotal: 'desc' } },
        take: 10,
      }),
      this.prisma.sale.groupBy({
        by: ['createdBy'],
        where,
        _sum: { totalAmount: true },
        _count: { id: true },
        _avg: { totalAmount: true },
      }),
    ]);

    return {
      date: targetDate.toISOString().split('T')[0],
      totalSales: Number(totalSales._sum.totalAmount || 0),
      transactionCount,
      averageTransactionValue: Number(totalSales._avg.totalAmount || 0),
      paymentMethods: paymentMethods.map(method => ({
        method: method.paymentMethod,
        totalAmount: Number(method._sum.amount || 0),
        count: method._count.id,
      })),
      topProducts: topProducts.map(product => ({
        name: product.itemName,
        quantity: Number(product._sum.quantity || 0),
        revenue: Number(product._sum.lineTotal || 0),
        salesCount: product._count.id,
      })),
      salesByUser: salesByUser.map(user => ({
        userId: user.createdBy,
        totalSales: Number(user._sum.totalAmount || 0),
        transactionCount: user._count.id,
        averageValue: Number(user._avg.totalAmount || 0),
      })),
    };
  }

  async getParkedSales(userId: string) {
    return this.prisma.sale.findMany({
      where: {
        status: SaleStatus.DRAFT,
        createdBy: userId,
      },
      include: {
        customer: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
        _count: { select: { saleItems: true, payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async parkSale(saleId: string, userId: string) {
    const sale = await this.getSaleById(saleId);

    if (sale.createdBy !== userId) {
      throw new ForbiddenException('You can only park your own sales');
    }

    if (sale.status !== SaleStatus.DRAFT) {
      throw new BadRequestException('Can only park draft sales');
    }

    return this.prisma.sale.update({
      where: { id: saleId },
      data: { status: SaleStatus.DRAFT },
    });
  }

  async resumeSale(saleId: string, userId: string) {
    const sale = await this.getSaleById(saleId);

    if (sale.createdBy !== userId) {
      throw new ForbiddenException('You can only resume your own sales');
    }

    if (sale.status !== SaleStatus.DRAFT) {
      throw new BadRequestException('Can only resume draft sales');
    }

    return sale;
  }

  // Helper methods
  private async validateStock(items: any[], locationId: string) {
    for (const item of items) {
      if (item.itemType === ItemType.PRODUCT && item.productId) {
        const stockBalance = await this.prisma.stockBalance.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId,
            },
          },
        });

        if (!stockBalance || stockBalance.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${item.itemName}. Available: ${stockBalance?.quantity || 0}, Required: ${item.quantity}`,
          );
        }
      }
    }
  }

  private calculateTotals(items: any[], taxRate: number, discountType?: DiscountType, discountValue?: number) {
    const subtotal = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = this.calculateItemDiscount(itemSubtotal, item.itemDiscountType, item.itemDiscountRate);
      return sum + itemSubtotal - itemDiscount;
    }, 0);

    const saleDiscount = this.calculateSaleDiscount(subtotal, discountType, discountValue);
    const subtotalAfterDiscount = subtotal - saleDiscount;
    const taxAmount = subtotalAfterDiscount * (taxRate / 100);
    const totalAmount = subtotalAfterDiscount + taxAmount;

    return {
      subtotal,
      discountAmount: saleDiscount,
      taxAmount,
      totalAmount,
    };
  }

  private calculateItemTotals(item: any) {
    const lineSubtotal = item.quantity * item.unitPrice;
    const itemDiscount = this.calculateItemDiscount(lineSubtotal, item.itemDiscountType, item.itemDiscountRate);
    const itemTaxAmount = (lineSubtotal - itemDiscount) * ((item.itemTaxRate || 0) / 100);
    const lineTotal = lineSubtotal - itemDiscount + itemTaxAmount;

    return {
      lineSubtotal,
      itemDiscountAmount: itemDiscount,
      itemTaxAmount,
      lineTotal,
    };
  }

  private calculateItemDiscount(subtotal: number, discountType?: DiscountType, discountRate?: number) {
    if (!discountType || !discountRate) return 0;
    
    if (discountType === DiscountType.PERCENTAGE) {
      return subtotal * (discountRate / 100);
    } else {
      return Math.min(discountRate, subtotal);
    }
  }

  private calculateSaleDiscount(subtotal: number, discountType?: DiscountType, discountValue?: number) {
    if (!discountType || !discountValue) return 0;
    
    if (discountType === DiscountType.PERCENTAGE) {
      return subtotal * (discountValue / 100);
    } else {
      return Math.min(discountValue, subtotal);
    }
  }

  private async createStockTransactions(sale: any, items: any[], locationId: string, userId: string, tx: any) {
    for (const item of items) {
      if (item.itemType === ItemType.PRODUCT && item.productId) {
        // Create stock transaction directly within the existing transaction
        await tx.stockTransaction.create({
          data: {
            productId: item.productId,
            fromLocationId: locationId,
            type: 'ISSUE',
            quantity: item.quantity,
            referenceNo: `SALE-${sale.saleNumber}`,
            remarks: `POS Sale ${sale.saleNumber}`,
            saleId: sale.id,
            createdBy: userId,
          },
        });

        // Update stock balance directly
        await this.updateStockBalanceForSale(tx, item.productId, locationId, item.quantity);
      }
    }
  }

  private async updateStockBalanceForSale(tx: any, productId: string, locationId: string, quantity: number) {
    // Find existing stock balance
    const stockBalance = await tx.stockBalance.findUnique({
      where: {
        productId_locationId: {
          productId,
          locationId,
        },
      },
    });

    if (stockBalance) {
      // Update existing stock balance
      await tx.stockBalance.update({
        where: {
          productId_locationId: {
            productId,
            locationId,
          },
        },
        data: {
          quantity: stockBalance.quantity - quantity,
        },
      });
    } else {
      // Create new stock balance (shouldn't happen in normal flow)
      console.warn(`No stock balance found for product ${productId} at location ${locationId}`);
    }
  }

  private async reverseStockTransactions(saleId: string, userId: string, tx: any) {
    const stockTransactions = await tx.stockTransaction.findMany({
      where: { saleId },
    });

    for (const transaction of stockTransactions) {
      await this.stockTransactionsService.create(
        {
          productId: transaction.productId,
          fromLocationId: transaction.toLocationId,
          toLocationId: transaction.fromLocationId,
          type: 'ADJUSTMENT',
          quantity: transaction.quantity,
          referenceNo: `REVERSE-${transaction.referenceNo}`,
          remarks: `Reverse stock for cancelled sale`,
        },
        userId,
      );
    }
  }

  private async updateCustomerStats(customerId: string, amount: number, tx: any) {
    await tx.customer.update({
      where: { id: customerId },
      data: {
        totalPurchases: { increment: amount },
        lastPurchaseDate: new Date(),
      },
    });
  }

  private validateStatusTransition(currentStatus: SaleStatus, newStatus: SaleStatus) {
    const validTransitions: Record<SaleStatus, SaleStatus[]> = {
      [SaleStatus.DRAFT]: [SaleStatus.COMPLETED, SaleStatus.PARTIAL, SaleStatus.CREDIT, SaleStatus.CANCELLED],
      [SaleStatus.COMPLETED]: [SaleStatus.CANCELLED, SaleStatus.REFUNDED],
      [SaleStatus.PARTIAL]: [SaleStatus.COMPLETED, SaleStatus.CANCELLED],
      [SaleStatus.CREDIT]: [SaleStatus.COMPLETED, SaleStatus.CANCELLED],
      [SaleStatus.CANCELLED]: [],
      [SaleStatus.REFUNDED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private async generateSaleNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const lastSale = await this.prisma.sale.findFirst({
      where: {
        saleNumber: {
          startsWith: `POS-${dateStr}`,
        },
      },
      orderBy: { saleNumber: 'desc' },
    });

    let sequence = 1;
    if (lastSale) {
      const lastSequence = parseInt(lastSale.saleNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `POS-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }

  private async generateRefundNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const lastRefund = await this.prisma.saleRefund.findFirst({
      where: {
        refundNumber: {
          startsWith: `RFN-${dateStr}`,
        },
      },
      orderBy: { refundNumber: 'desc' },
    });

    let sequence = 1;
    if (lastRefund) {
      const lastSequence = parseInt(lastRefund.refundNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `RFN-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }
}
