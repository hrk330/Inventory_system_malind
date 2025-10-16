import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(userId?: string, entityName?: string, action?: string, limit?: string, offset?: string): Promise<{
        logs: ({
            user: {
                name: string;
                email: string;
                id: string;
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
    getSummary(): Promise<{
        totalLogs: number;
        recentLogs: ({
            user: {
                name: string;
                email: string;
                id: string;
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
