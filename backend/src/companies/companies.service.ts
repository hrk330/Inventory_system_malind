import { Injectable, BadRequestException, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);
  constructor(private prisma: PrismaService) {}

  async create(name: string, code?: string) {
    const existing = await this.prisma.company.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      select: { id: true }
    });
    if (existing) throw new ConflictException('Company with this name already exists');
    return this.prisma.company.create({ data: { name, code } });
  }

  async findAll(params: { page?: number; limit?: number; search?: string; isActive?: boolean }) {
    const { page = 1, limit = 10, search, isActive } = params;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isActive !== undefined) where.isActive = isActive;
    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({ 
        where, 
        orderBy: { name: 'asc' }, 
        skip, 
        take: limit,
        include: { _count: { select: { products: true } } }
      }),
      this.prisma.company.count({ where }),
    ]);
    const data = companies.map(c => ({
      id: c.id,
      name: c.name,
      code: c.code || undefined,
      isActive: c.isActive,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      productCount: (c as any)._count?.products || 0,
    }));
    return { data, meta: { page, limit, total } };
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(id: string, data: { name?: string; code?: string; isActive?: boolean }) {
    await this.findOne(id);
    if (data.name) {
      const exists = await this.prisma.company.findFirst({
        where: { name: { equals: data.name, mode: 'insensitive' }, id: { not: id } },
        select: { id: true },
      });
      if (exists) throw new ConflictException('Company with this name already exists');
    }
    return this.prisma.company.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    await this.findOne(id);
    return this.prisma.company.update({ where: { id }, data: { isActive: false } });
  }

  async getProducts(id: string, params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;
    const where: any = { companyId: id, deletedAt: null };
    if (search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        select: {
          id: true, name: true, sku: true, sellingPrice: true, isActive: true,
          category: { select: { id: true, name: true } },
          uom: { select: { id: true, name: true, symbol: true } },
        },
        orderBy: { name: 'asc' }, skip, take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data: products, meta: { page, limit, total } };
  }
}


