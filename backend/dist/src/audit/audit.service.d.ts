import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId?: string, entityName?: string, action?: string, limit?: number, offset?: number): Promise<{
        logs: ({
            user: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            userId: string;
            entityName: string;
            entityId: string;
            action: import(".prisma/client").$Enums.AuditAction;
            oldValue: import("@prisma/client/runtime/library").JsonValue | null;
            newValue: import("@prisma/client/runtime/library").JsonValue | null;
            timestamp: Date;
        })[];
        total: number;
        limit: number;
        offset: number;
    }>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        userId: string;
        entityName: string;
        entityId: string;
        action: import(".prisma/client").$Enums.AuditAction;
        oldValue: import("@prisma/client/runtime/library").JsonValue | null;
        newValue: import("@prisma/client/runtime/library").JsonValue | null;
        timestamp: Date;
    }>;
    log(userId: string, entityName: string, entityId: string, action: 'CREATE' | 'UPDATE' | 'DELETE', oldValue?: any, newValue?: any): Promise<{
        id: string;
        userId: string;
        entityName: string;
        entityId: string;
        action: import(".prisma/client").$Enums.AuditAction;
        oldValue: import("@prisma/client/runtime/library").JsonValue | null;
        newValue: import("@prisma/client/runtime/library").JsonValue | null;
        timestamp: Date;
    }>;
    getAuditSummary(): Promise<{
        totalLogs: number;
        recentLogs: ({
            user: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            userId: string;
            entityName: string;
            entityId: string;
            action: import(".prisma/client").$Enums.AuditAction;
            oldValue: import("@prisma/client/runtime/library").JsonValue | null;
            newValue: import("@prisma/client/runtime/library").JsonValue | null;
            timestamp: Date;
        })[];
        actionCounts: Record<string, number>;
    }>;
}
