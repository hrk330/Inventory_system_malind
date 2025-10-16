import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    userId?: string,
    entityName?: string,
    action?: string,
    limit: number = 100,
    offset: number = 0,
  ) {
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (entityName) {
      where.entityName = entityName;
    }
    
    if (action) {
      where.action = action;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async log(
    userId: string,
    entityName: string,
    entityId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    oldValue?: any,
    newValue?: any,
  ) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        entityName,
        entityId,
        action,
        oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
        newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
      },
    });
  }

  async getAuditSummary() {
    const [totalLogs, recentLogs, actionCounts] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        _count: {
          action: true,
        },
      }),
    ]);

    return {
      totalLogs,
      recentLogs,
      actionCounts: actionCounts.reduce((acc, item) => {
        acc[item.action] = item._count.action;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
