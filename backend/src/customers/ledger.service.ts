import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerLedgerQueryDto } from './dto/ledger-query.dto';

@Injectable()
export class CustomerLedgerService {
  private readonly logger = new Logger(CustomerLedgerService.name);

  constructor(private prisma: PrismaService) {}

  async getCustomerLedger(customerId: string, queryDto: CustomerLedgerQueryDto) {
    try {
      this.logger.log(`Getting customer ledger for customer ${customerId}`);

      // Get customer info
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          customerNumber: true,
          address: true,
        },
      });

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      const { startDate, endDate } = queryDto;

      // Get all sales for this customer
      const sales = await this.prisma.sale.findMany({
        where: {
          customerId,
          ...(startDate || endDate ? {
            saleDate: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          } : {}),
        },
        select: {
          id: true,
          saleNumber: true,
          saleDate: true,
          totalAmount: true,
          amountPaid: true,
          status: true,
          paymentStatus: true,
          customerPayments: {
            select: {
              id: true,
              amount: true,
              paymentMethod: true,
              referenceNumber: true,
              paymentDate: true,
              notes: true,
            },
            orderBy: {
              paymentDate: 'asc',
            },
          },
        },
        orderBy: {
          saleDate: 'asc',
        },
      });

      // Customer payments are now included in the sales query above

      // Get all refunds for this customer
      const refunds = await this.prisma.saleRefund.findMany({
        where: {
          originalSale: {
            customerId,
          },
          ...(startDate || endDate ? {
            createdAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          } : {}),
        },
        select: {
          id: true,
          refundAmount: true,
          refundNumber: true,
          createdAt: true,
          reason: true,
          originalSale: {
            select: {
              saleNumber: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Calculate summary
      const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
      
      // Calculate total paid using hybrid approach
      // Primary: Use individual payment records (CustomerPayment)
      // Fallback: Use amountPaid for any missing historical data
      const totalPaidFromPayments = sales.reduce((sum, sale) => {
        return sum + sale.customerPayments.reduce((paymentSum, payment) => {
          return paymentSum + Number(payment.amount);
        }, 0);
      }, 0);
      
      // Calculate total amountPaid from all sales
      const totalAmountPaid = sales.reduce((sum, sale) => sum + Number(sale.amountPaid), 0);
      
      // Use the higher of the two values to ensure we don't miss any payments
      // This handles cases where historical payments exist in amountPaid but not in CustomerPayment records
      const totalPaid = Math.max(totalPaidFromPayments, totalAmountPaid);
      
      const totalRefunds = refunds.reduce((sum, refund) => sum + Number(refund.refundAmount), 0);
      const currentBalance = totalSales - totalPaid - totalRefunds;

      // Create virtual payment transactions for any missing historical payments
      const virtualPaymentTransactions = sales
        .filter(sale => Number(sale.amountPaid) > 0)
        .map(sale => {
          // Calculate how much of this sale's amountPaid is not covered by CustomerPayment records
          const coveredAmount = sale.customerPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
          const uncoveredAmount = Number(sale.amountPaid) - coveredAmount;
          
          if (uncoveredAmount > 0) {
            return {
              id: `historical-${sale.id}`,
              date: sale.saleDate, // Use sale date as payment date for historical payments
              type: 'PAYMENT' as const,
              reference: sale.saleNumber,
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
        ...sales.map(sale => ({
          id: sale.id,
          date: sale.saleDate,
          type: 'SALE' as const,
          reference: sale.saleNumber,
          description: `Sale - ${sale.status}`,
          debit: Number(sale.totalAmount),
          credit: 0,
          balance: 0, // Will be calculated
        })),
        ...refunds.map(refund => ({
          id: refund.id,
          date: refund.createdAt,
          type: 'REFUND' as const,
          reference: refund.refundNumber,
          description: `Refund - ${refund.reason}`,
          debit: 0,
          credit: Number(refund.refundAmount),
          balance: 0, // Will be calculated
        })),
        ...sales.flatMap(sale => 
          sale.customerPayments.map(payment => ({
            id: payment.id,
            date: payment.paymentDate,
            type: 'PAYMENT' as const,
            reference: sale.saleNumber,
            description: `Payment - ${payment.paymentMethod}${payment.referenceNumber ? ` (${payment.referenceNumber})` : ''}`,
            debit: 0,
            credit: Number(payment.amount),
            balance: 0, // Will be calculated
          }))
        ),
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

      // Calculate total payment records count
      const totalPaymentRecords = sales.reduce((sum, sale) => sum + sale.customerPayments.length, 0);
      
      this.logger.log(`Customer ledger calculated - Sales: ${totalSales}, Paid: ${totalPaid}, Refunds: ${totalRefunds}, Balance: ${currentBalance}`);
      this.logger.log(`Customer payments found: ${totalPaymentRecords} payments totaling ${totalPaidFromPayments}`);
      this.logger.log(`Sales found: ${sales.length} sales totaling ${totalSales}`);

      return {
        customer,
        summary: {
          totalSales,
          totalPaid,
          totalRefunds,
          currentBalance,
          totalTransactions: ledgerEntries.length,
        },
        ledger: ledgerEntries,
      };
    } catch (error) {
      this.logger.error(`Error getting customer ledger for customer ${customerId}:`, error);
      throw error;
    }
  }

  async exportToCsv(customerId: string, queryDto: CustomerLedgerQueryDto): Promise<string> {
    const ledgerData = await this.getCustomerLedger(customerId, queryDto);
    
    const headers = ['Date', 'Type', 'Reference', 'Description', 'Debit', 'Credit', 'Balance'];
    const rows = ledgerData.ledger.map(entry => [
      new Date(entry.date).toISOString().split('T')[0],
      entry.type,
      entry.reference,
      entry.description,
      entry.debit.toFixed(2),
      entry.credit.toFixed(2),
      entry.balance.toFixed(2),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  async exportToPdf(customerId: string, queryDto: CustomerLedgerQueryDto): Promise<Buffer> {
    // This would require a PDF library like puppeteer or pdfkit
    // For now, return a simple text representation
    const ledgerData = await this.getCustomerLedger(customerId, queryDto);
    
    const content = `
Customer Ledger Report
Customer: ${ledgerData.customer.name}
Generated: ${new Date().toISOString()}

Summary:
Total Sales: $${ledgerData.summary.totalSales.toFixed(2)}
Total Paid: $${ledgerData.summary.totalPaid.toFixed(2)}
Total Refunds: $${ledgerData.summary.totalRefunds.toFixed(2)}
Current Balance: $${ledgerData.summary.currentBalance.toFixed(2)}

Transactions:
${ledgerData.ledger.map(entry => 
  `${new Date(entry.date).toISOString().split('T')[0]} | ${entry.type} | ${entry.reference} | ${entry.description} | $${entry.debit.toFixed(2)} | $${entry.credit.toFixed(2)} | $${entry.balance.toFixed(2)}`
).join('\n')}
    `;

    return Buffer.from(content, 'utf-8');
  }
}
