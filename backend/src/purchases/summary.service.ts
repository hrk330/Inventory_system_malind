import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SummaryQueryDto } from './dto/summary-query.dto';

@Injectable()
export class PurchaseSummaryService {
  constructor(private prisma: PrismaService) {}

  async getSummary(queryDto: SummaryQueryDto) {
    const { startDate, endDate } = queryDto;
    
    const whereClause: any = {};
    if (startDate || endDate) {
      whereClause.orderDate = {};
      if (startDate) whereClause.orderDate.gte = new Date(startDate);
      if (endDate) whereClause.orderDate.lte = new Date(endDate);
    }

    // Get current month and year for comparison
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentYear = new Date(now.getFullYear(), 0, 1);

    // Total orders
    const totalOrders = await this.prisma.purchaseOrder.count({
      where: whereClause,
    });

    // Pending orders
    const pendingOrders = await this.prisma.purchaseOrder.count({
      where: {
        ...whereClause,
        status: 'PENDING',
      },
    });

    // Completed orders
    const completedOrders = await this.prisma.purchaseOrder.count({
      where: {
        ...whereClause,
        status: 'RECEIVED',
      },
    });

    // Total value
    const totalValueResult = await this.prisma.purchaseOrder.aggregate({
      where: whereClause,
      _sum: {
        totalAmount: true,
      },
    });

    // This month's value
    const monthlyValueResult = await this.prisma.purchaseOrder.aggregate({
      where: {
        ...whereClause,
        orderDate: {
          gte: currentMonth,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // This year's value
    const yearlyValueResult = await this.prisma.purchaseOrder.aggregate({
      where: {
        ...whereClause,
        orderDate: {
          gte: currentYear,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Top suppliers
    const topSuppliers = await this.prisma.purchaseOrder.groupBy({
      by: ['supplierId'],
      where: whereClause,
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: 5,
    });

    // Get supplier details
    const supplierIds = topSuppliers.map(s => s.supplierId);
    const suppliers = await this.prisma.supplier.findMany({
      where: {
        id: { in: supplierIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const topSuppliersWithNames = topSuppliers.map(supplier => {
      const supplierInfo = suppliers.find(s => s.id === supplier.supplierId);
      return {
        id: supplier.supplierId,
        name: supplierInfo?.name || 'Unknown Supplier',
        totalValue: Number(supplier._sum.totalAmount || 0),
        orderCount: supplier._count.id,
      };
    });

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalValue: Number(totalValueResult._sum.totalAmount || 0),
      totalValueMonth: Number(monthlyValueResult._sum.totalAmount || 0),
      totalValueYear: Number(yearlyValueResult._sum.totalAmount || 0),
      topSuppliers: topSuppliersWithNames,
    };
  }

  async getMonthlyTrends(queryDto: SummaryQueryDto) {
    const { startDate, endDate } = queryDto;
    
    // Default to last 12 months if no date range provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getFullYear() - 1, end.getMonth(), 1);

    const trends = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "order_date") as month,
        COUNT(*) as total_orders,
        SUM("total_amount") as total_value
      FROM purchase_orders 
      WHERE "order_date" >= ${start} AND "order_date" <= ${end}
      GROUP BY DATE_TRUNC('month', "order_date")
      ORDER BY month ASC
    `;

    return trends;
  }

  async getTopSuppliers(queryDto: SummaryQueryDto) {
    const { startDate, endDate, limit = 10 } = queryDto;
    
    const whereClause: any = {};
    if (startDate || endDate) {
      whereClause.orderDate = {};
      if (startDate) whereClause.orderDate.gte = new Date(startDate);
      if (endDate) whereClause.orderDate.lte = new Date(endDate);
    }

    const topSuppliers = await this.prisma.purchaseOrder.groupBy({
      by: ['supplierId'],
      where: whereClause,
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: limit,
    });

    // Get supplier details
    const supplierIds = topSuppliers.map(s => s.supplierId);
    const suppliers = await this.prisma.supplier.findMany({
      where: {
        id: { in: supplierIds },
      },
      select: {
        id: true,
        name: true,
        contactPerson: true,
        email: true,
      },
    });

    return topSuppliers.map(supplier => {
      const supplierInfo = suppliers.find(s => s.id === supplier.supplierId);
      return {
        id: supplier.supplierId,
        name: supplierInfo?.name || 'Unknown Supplier',
        contactPerson: supplierInfo?.contactPerson,
        email: supplierInfo?.email,
        totalValue: Number(supplier._sum.totalAmount || 0),
        orderCount: supplier._count.id,
        averageOrderValue: Number(supplier._sum.totalAmount || 0) / supplier._count.id,
      };
    });
  }
}
