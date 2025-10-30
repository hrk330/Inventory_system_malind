import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerQueryDto } from './dto/ledger-query.dto';

@Injectable()
export class SupplierLedgerService {
  constructor(private prisma: PrismaService) {}

  async getSupplierLedger(supplierId: string, queryDto: LedgerQueryDto) {
    const { startDate, endDate } = queryDto;

    // Verify supplier exists
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      select: {
        id: true,
        name: true,
        contactPerson: true,
        email: true,
        phone: true,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const whereClause: any = { supplierId };
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    // Get all purchase orders
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      where: {
        supplierId,
        ...(startDate || endDate ? {
          orderDate: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        } : {}),
      },
      select: {
        id: true,
        orderNumber: true,
        orderDate: true,
        totalAmount: true,
        amountPaid: true,
        status: true,
        paymentStatus: true,
      },
      orderBy: {
        orderDate: 'asc',
      },
    });

    // Get all purchase returns
    const purchaseReturns = await this.prisma.purchaseReturn.findMany({
      where: {
        supplierId,
        ...(startDate || endDate ? {
          returnDate: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        } : {}),
      },
      select: {
        id: true,
        returnNumber: true,
        returnDate: true,
        totalAmount: true,
        status: true,
        reason: true,
      },
      orderBy: {
        returnDate: 'asc',
      },
    });

    // Get all purchase payments
    const purchasePayments = await this.prisma.purchasePayment.findMany({
      where: {
        purchaseOrder: {
          supplierId,
        },
        ...(startDate || endDate ? {
          paymentDate: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        } : {}),
      },
      select: {
        id: true,
        amount: true,
        paymentMethod: true,
        referenceNumber: true,
        paymentDate: true,
        notes: true,
        purchaseOrder: {
          select: {
            orderNumber: true,
          },
        },
      },
      orderBy: {
        paymentDate: 'asc',
      },
    });

    // Create virtual payment transactions for any missing historical payments
    const virtualPaymentTransactions = purchaseOrders
      .filter(order => Number(order.amountPaid) > 0)
      .map(order => {
        // Calculate how much of this order's amountPaid is not covered by PurchasePayment records
        const orderPayments = purchasePayments.filter(payment => payment.purchaseOrder.orderNumber === order.orderNumber);
        const coveredAmount = orderPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        const uncoveredAmount = Number(order.amountPaid) - coveredAmount;
        
        if (uncoveredAmount > 0) {
          return {
            id: `historical-${order.id}`,
            date: order.orderDate, // Use order date as payment date for historical payments
            type: 'PAYMENT' as const,
            reference: order.orderNumber,
            description: `Payment - Historical (${uncoveredAmount > 0 ? 'Partial' : 'Full'})`,
            debit: 0,
            credit: uncoveredAmount,
            balance: 0, // Will be calculated
          };
        }
        return null;
      })
      .filter(Boolean);

    // Combine and sort all transactions
    const transactions = [
      ...purchaseOrders.map(order => ({
        id: order.id,
        date: order.orderDate,
        type: 'PURCHASE' as const,
        reference: order.orderNumber,
        description: `Purchase Order - ${order.status}`,
        debit: Number(order.totalAmount),
        credit: 0,
        balance: 0, // Will be calculated
      })),
      ...purchaseReturns.map(returnItem => ({
        id: returnItem.id,
        date: returnItem.returnDate,
        type: 'RETURN' as const,
        reference: returnItem.returnNumber,
        description: `Purchase Return - ${returnItem.reason}`,
        debit: 0,
        credit: Number(returnItem.totalAmount),
        balance: 0, // Will be calculated
      })),
      ...purchasePayments.map(payment => ({
        id: payment.id,
        date: payment.paymentDate,
        type: 'PAYMENT' as const,
        reference: payment.purchaseOrder.orderNumber,
        description: `Payment - ${payment.paymentMethod}${payment.referenceNumber ? ` (${payment.referenceNumber})` : ''}`,
        debit: 0,
        credit: Number(payment.amount),
        balance: 0, // Will be calculated
      })),
      ...virtualPaymentTransactions,
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let runningBalance = 0;
    const ledgerEntries = transactions.map(transaction => {
      runningBalance += transaction.debit - transaction.credit;
      return {
        ...transaction,
        balance: runningBalance,
      };
    });

    // Calculate summary
    const totalPurchases = purchaseOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    
    // Calculate total paid using hybrid approach
    // Primary: Use individual payment records (PurchasePayment)
    // Fallback: Use amountPaid for any missing historical data
    const totalPaidFromPayments = purchasePayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    
    // Calculate total amountPaid from all orders
    const totalAmountPaid = purchaseOrders.reduce((sum, order) => sum + Number(order.amountPaid), 0);
    
    // Use the higher of the two values to ensure we don't miss any payments
    // This handles cases where historical payments exist in amountPaid but not in PurchasePayment records
    const totalPaid = Math.max(totalPaidFromPayments, totalAmountPaid);
    
    const totalReturns = purchaseReturns.reduce((sum, returnItem) => sum + Number(returnItem.totalAmount), 0);
    const currentBalance = totalPurchases - totalPaid - totalReturns;

    return {
      supplier,
      summary: {
        totalPurchases,
        totalPaid,
        totalReturns,
        currentBalance,
        totalTransactions: ledgerEntries.length,
      },
      ledger: ledgerEntries,
    };
  }

  async exportToCsv(supplierId: string, queryDto: LedgerQueryDto): Promise<string> {
    const ledger = await this.getSupplierLedger(supplierId, queryDto);
    
    let csv = 'Date,Type,Reference,Description,Debit,Credit,Balance\n';
    
    ledger.ledger.forEach(entry => {
      csv += `"${entry.date.toISOString().split('T')[0]}","${entry.type}","${entry.reference}","${entry.description}","${entry.debit}","${entry.credit}","${entry.balance}"\n`;
    });
    
    return csv;
  }

  async exportToPdf(supplierId: string, queryDto: LedgerQueryDto): Promise<Buffer> {
    // This is a placeholder - you would implement actual PDF generation here
    const ledger = await this.getSupplierLedger(supplierId, queryDto);
    const content = `Supplier Ledger - ${ledger.supplier.name}\n\nTotal Purchases: $${ledger.summary.totalPurchases.toFixed(2)}\nTotal Paid: $${ledger.summary.totalPaid.toFixed(2)}\nCurrent Balance: $${ledger.summary.currentBalance.toFixed(2)}\n`;
    return Buffer.from(content, 'utf-8');
  }
}
