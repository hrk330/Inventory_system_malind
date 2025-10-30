import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsQueryDto } from './dto/reports-query.dto';

@Injectable()
export class PurchaseReportsService {
  constructor(private prisma: PrismaService) {}

  async getReports(queryDto: ReportsQueryDto) {
    const { startDate, endDate, supplierId, productId, status } = queryDto;
    
    const whereClause: any = {};
    if (startDate || endDate) {
      whereClause.orderDate = {};
      if (startDate) whereClause.orderDate.gte = new Date(startDate);
      if (endDate) whereClause.orderDate.lte = new Date(endDate);
    }
    if (supplierId) whereClause.supplierId = supplierId;
    if (status) whereClause.status = status;

    // Get purchase orders with related data
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      where: whereClause,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
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
      },
      orderBy: {
        orderDate: 'desc',
      },
    });

    // Calculate totals
    const totalOrders = purchaseOrders.length;
    const totalValue = purchaseOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const totalItems = purchaseOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    // Top purchased products
    const productStats = new Map();
    purchaseOrders.forEach(order => {
      order.items.forEach(item => {
        const productKey = item.product.id;
        if (!productStats.has(productKey)) {
          productStats.set(productKey, {
            product: item.product,
            totalQuantity: 0,
            totalValue: 0,
            orderCount: 0,
          });
        }
        const stats = productStats.get(productKey);
        stats.totalQuantity += item.quantity;
        stats.totalValue += Number(item.totalPrice);
        stats.orderCount += 1;
      });
    });

    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);

    // Top suppliers
    const supplierStats = new Map();
    purchaseOrders.forEach(order => {
      const supplierKey = order.supplier.id;
      if (!supplierStats.has(supplierKey)) {
        supplierStats.set(supplierKey, {
          supplier: order.supplier,
          totalValue: 0,
          orderCount: 0,
        });
      }
      const stats = supplierStats.get(supplierKey);
      stats.totalValue += Number(order.totalAmount);
      stats.orderCount += 1;
    });

    const topSuppliers = Array.from(supplierStats.values())
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);

    return {
      summary: {
        totalOrders,
        totalValue,
        totalItems,
        averageOrderValue: totalOrders > 0 ? totalValue / totalOrders : 0,
      },
      topProducts,
      topSuppliers,
      purchaseOrders: purchaseOrders.slice(0, 100), // Limit for performance
    };
  }

  async getMonthlyComparison(queryDto: ReportsQueryDto) {
    const { startDate, endDate } = queryDto;
    
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getFullYear() - 1, end.getMonth(), 1);

    // Get monthly purchases
    const monthlyPurchases = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "order_date") as month,
        COUNT(*) as purchase_orders,
        SUM("total_amount") as purchase_value
      FROM purchase_orders 
      WHERE "order_date" >= ${start} AND "order_date" <= ${end}
      GROUP BY DATE_TRUNC('month', "order_date")
      ORDER BY month ASC
    `;

    // Get monthly returns
    const monthlyReturns = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "return_date") as month,
        COUNT(*) as return_orders,
        SUM("total_amount") as return_value
      FROM purchase_returns 
      WHERE "return_date" >= ${start} AND "return_date" <= ${end}
      GROUP BY DATE_TRUNC('month', "return_date")
      ORDER BY month ASC
    `;

    return {
      monthlyPurchases,
      monthlyReturns,
    };
  }

  async getProductAnalysis(queryDto: ReportsQueryDto) {
    const { startDate, endDate, supplierId } = queryDto;
    
    const whereClause: any = {};
    if (startDate || endDate) {
      whereClause.orderDate = {};
      if (startDate) whereClause.orderDate.gte = new Date(startDate);
      if (endDate) whereClause.orderDate.lte = new Date(endDate);
    }
    if (supplierId) whereClause.supplierId = supplierId;

    const productAnalysis = await this.prisma.purchaseItem.groupBy({
      by: ['productId'],
      where: {
        purchaseOrder: whereClause,
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalPrice: 'desc',
        },
      },
    });

    // Get product details
    const productIds = productAnalysis.map(p => p.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    return productAnalysis.map(analysis => {
      const product = products.find(p => p.id === analysis.productId);
      return {
        product: product || { id: analysis.productId, name: 'Unknown Product', sku: 'N/A' },
        totalQuantity: Number(analysis._sum.quantity || 0),
        totalValue: Number(analysis._sum.totalPrice || 0),
        orderCount: analysis._count.id,
        averagePrice: Number(analysis._sum.totalPrice || 0) / Number(analysis._sum.quantity || 1),
      };
    });
  }

  async exportToCsv(queryDto: ReportsQueryDto): Promise<string> {
    const reports = await this.getReports(queryDto);
    
    let csv = 'Order Number,Supplier,Order Date,Total Amount,Status,Payment Status,Items Count\n';
    
    reports.purchaseOrders.forEach(order => {
      csv += `"${order.orderNumber}","${order.supplier.name}","${order.orderDate.toISOString().split('T')[0]}","${order.totalAmount}","${order.status}","${order.paymentStatus}","${order.items.length}"\n`;
    });
    
    return csv;
  }

  async exportToPdf(queryDto: ReportsQueryDto): Promise<Buffer> {
    // This is a placeholder - you would implement actual PDF generation here
    // For now, return a simple text buffer
    const reports = await this.getReports(queryDto);
    const content = `Purchase Reports\n\nTotal Orders: ${reports.summary.totalOrders}\nTotal Value: $${reports.summary.totalValue.toFixed(2)}\n`;
    return Buffer.from(content, 'utf-8');
  }
}
