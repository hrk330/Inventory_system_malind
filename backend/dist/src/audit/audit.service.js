"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditService = class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId, entityName, action, limit = 100, offset = 0) {
        const where = {};
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
    async findOne(id) {
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
    async log(userId, entityName, entityId, action, oldValue, newValue) {
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
            }, {}),
        };
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map