import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReorderService {
  constructor(private prisma: PrismaService) {}

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

  async getReorderSummary() {
    const alerts = await this.getReorderAlerts();
    
    const summary = {
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(alert => alert.quantity <= 0).length,
      lowStockAlerts: alerts.filter(alert => alert.quantity > 0 && alert.quantity < alert.product.reorderLevel).length,
      alertsByLocation: this.groupByLocation(alerts),
      alertsByProduct: this.groupByProduct(alerts),
    };

    return summary;
  }

  async getReorderSuggestions(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        uom: {
          select: {
            symbol: true
          }
        },
        stockBalances: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    const totalStock = product.stockBalances.reduce((sum, balance) => sum + balance.quantity, 0);
    const suggestedReorder = Math.max(0, product.reorderLevel - totalStock);

    return {
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        unit: product.uom.symbol,
        reorderLevel: product.reorderLevel,
      },
      currentStock: totalStock,
      suggestedReorder,
      stockByLocation: product.stockBalances.map(balance => ({
        location: balance.location,
        quantity: balance.quantity,
        status: balance.quantity < product.reorderLevel ? 'LOW' : 'OK',
      })),
    };
  }

  private groupByLocation(alerts: any[]) {
    const grouped = alerts.reduce((acc, alert) => {
      const locationName = alert.location.name;
      if (!acc[locationName]) {
        acc[locationName] = [];
      }
      acc[locationName].push(alert);
      return acc;
    }, {});

    return Object.keys(grouped).map(locationName => ({
      location: locationName,
      count: grouped[locationName].length,
      alerts: grouped[locationName],
    }));
  }

  private groupByProduct(alerts: any[]) {
    const grouped = alerts.reduce((acc, alert) => {
      const productName = alert.product.name;
      if (!acc[productName]) {
        acc[productName] = [];
      }
      acc[productName].push(alert);
      return acc;
    }, {});

    return Object.keys(grouped).map(productName => ({
      product: productName,
      count: grouped[productName].length,
      alerts: grouped[productName],
    }));
  }
}
