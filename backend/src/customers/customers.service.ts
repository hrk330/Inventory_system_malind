import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerFiltersDto } from './dto/customer-filters.dto';
import { CustomerStatsDto } from './dto/customer-stats.dto';
import { createPaginatedResponse } from '../common/utils/pagination.helper';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto, userId: string) {
    // Check for duplicate email if provided
    if (createCustomerDto.email) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { email: createCustomerDto.email }
      });
      if (existingCustomer) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    // Generate unique customer number
    const customerNumber = await this.generateCustomerNumber();

    return this.prisma.customer.create({
      data: {
        ...createCustomerDto,
        customerNumber,
      },
    });
  }

  async findAll(filters: CustomerFiltersDto) {
    const { page = 1, limit = 10, search, isActive } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Apply search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Apply active status filter
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          customerNumber: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          loyaltyPoints: true,
          totalPurchases: true,
          lastPurchaseDate: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return createPaginatedResponse(customers, total, page, limit);
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          select: {
            id: true,
            saleNumber: true,
            saleDate: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,
          },
          orderBy: { saleDate: 'desc' },
          take: 10, // Last 10 sales
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async findByEmail(email: string) {
    return this.prisma.customer.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.customer.findFirst({
      where: { phone },
    });
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, userId: string) {
    const customer = await this.findOne(id);

    // Check for duplicate email if being updated
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { email: updateCustomerDto.email }
      });
      if (existingCustomer) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async updateLoyaltyPoints(id: string, points: number, action: 'ADD' | 'SUBTRACT', userId: string) {
    const customer = await this.findOne(id);

    const newPoints = action === 'ADD' 
      ? customer.loyaltyPoints + points 
      : Math.max(0, customer.loyaltyPoints - points);

    return this.prisma.customer.update({
      where: { id },
      data: { loyaltyPoints: newPoints },
    });
  }

  async delete(id: string, userId: string) {
    const customer = await this.findOne(id);

    // Soft delete - set isActive to false
    return this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getCustomerStats(id: string): Promise<CustomerStatsDto> {
    const customer = await this.findOne(id);

    // Get sales statistics
    const salesStats = await this.prisma.sale.aggregate({
      where: { customerId: id, status: 'COMPLETED' },
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    const totalPurchases = salesStats._count.id;
    const totalSpent = Number(salesStats._sum.totalAmount || 0);
    const averageOrderValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

    // Get last purchase date
    const lastSale = await this.prisma.sale.findFirst({
      where: { customerId: id, status: 'COMPLETED' },
      orderBy: { saleDate: 'desc' },
      select: { saleDate: true },
    });

    // Get this month's statistics
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthStats = await this.prisma.sale.aggregate({
      where: {
        customerId: id,
        status: 'COMPLETED',
        saleDate: { gte: startOfMonth },
      },
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    return {
      totalPurchases,
      totalSpent,
      averageOrderValue,
      lastPurchaseDate: lastSale?.saleDate || null,
      loyaltyPoints: customer.loyaltyPoints,
      purchasesThisMonth: thisMonthStats._count.id,
      spentThisMonth: Number(thisMonthStats._sum.totalAmount || 0),
    };
  }

  async getLedgerOverview(search?: string) {
    const where: any = {
      isActive: true,
    };

    // Apply search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { customerNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const customers = await this.prisma.customer.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        customerNumber: true,
        address: true,
        balance: true,
        totalPurchases: true,
        lastPurchaseDate: true,
        sales: {
          select: {
            id: true,
            totalAmount: true,
            amountPaid: true,
            status: true,
            saleDate: true,
            customerPayments: {
              select: {
                amount: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Pull refunds for all these customers in one query to avoid N+1
    const customerIds = customers.map(c => c.id);
    const refunds = await this.prisma.saleRefund.findMany({
      where: {
        originalSale: {
          customerId: { in: customerIds },
        },
      },
      select: {
        refundAmount: true,
        originalSale: { select: { customerId: true } },
      },
    });

    const customerIdToRefundTotal = new Map<string, number>();
    for (const r of refunds) {
      const cid = r.originalSale.customerId;
      customerIdToRefundTotal.set(cid, (customerIdToRefundTotal.get(cid) || 0) + Number(r.refundAmount));
    }

    return customers.map(customer => {
      // Mirror detailed ledger calculation:
      // - Sum sales totalAmount (all statuses) to match transaction list
      // - Compute totalPaid via hybrid approach
      // - Subtract refunds

      const totalSales = customer.sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);

      const totalPaidFromPayments = customer.sales.reduce((sum, sale) => {
        return sum + sale.customerPayments.reduce((paymentSum, payment) => {
          return paymentSum + Number(payment.amount);
        }, 0);
      }, 0);

      const totalAmountPaid = customer.sales.reduce((sum, sale) => sum + Number(sale.amountPaid), 0);
      const totalPaid = Math.max(totalPaidFromPayments, totalAmountPaid);

      const totalRefunds = customerIdToRefundTotal.get(customer.id) || 0;
      const currentBalance = totalSales - totalPaid - totalRefunds;

      const lastTransactionDate = customer.sales.length > 0 
        ? customer.sales.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())[0].saleDate
        : customer.lastPurchaseDate;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        customerNumber: customer.customerNumber,
        address: customer.address,
        balance: currentBalance,
        totalSales,
        totalPaid,
        totalRefunds,
        lastTransactionDate,
        transactionCount: customer.sales.length,
      };
    });
  }

  async searchCustomers(query: string) {
    return this.prisma.customer.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { customerNumber: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        customerNumber: true,
        name: true,
        email: true,
        phone: true,
        loyaltyPoints: true,
      },
      take: 10,
      orderBy: { name: 'asc' },
    });
  }

  private async generateCustomerNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Find the highest number for today
    const lastCustomer = await this.prisma.customer.findFirst({
      where: {
        customerNumber: {
          startsWith: `CUST-${dateStr}`,
        },
      },
      orderBy: { customerNumber: 'desc' },
    });

    let sequence = 1;
    if (lastCustomer) {
      const lastSequence = parseInt(lastCustomer.customerNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `CUST-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }
}
