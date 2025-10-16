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
var LocationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LocationsService = LocationsService_1 = class LocationsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(LocationsService_1.name);
    }
    async create(createLocationDto) {
        const existingLocation = await this.prisma.location.findFirst({
            where: { name: createLocationDto.name },
        });
        if (existingLocation) {
            throw new common_1.ConflictException('Location with this name already exists');
        }
        return this.prisma.location.create({
            data: createLocationDto,
        });
    }
    async findAll(search, type) {
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (type) {
            where.type = type;
        }
        return this.prisma.location.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const location = await this.prisma.location.findUnique({
            where: { id },
        });
        if (!location) {
            throw new common_1.NotFoundException('Location not found');
        }
        return location;
    }
    async update(id, updateLocationDto) {
        await this.findOne(id);
        if (updateLocationDto.name) {
            const existingLocation = await this.prisma.location.findFirst({
                where: {
                    name: updateLocationDto.name,
                    id: { not: id }
                },
            });
            if (existingLocation) {
                throw new common_1.ConflictException('Location with this name already exists');
            }
        }
        return this.prisma.location.update({
            where: { id },
            data: updateLocationDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        const stockBalances = await this.prisma.stockBalance.findMany({
            where: { locationId: id },
        });
        if (stockBalances.length > 0) {
            throw new common_1.ConflictException('Cannot delete location with existing stock balances');
        }
        await this.prisma.location.delete({
            where: { id },
        });
        return { message: 'Location deleted successfully' };
    }
    async getTypes() {
        return ['WAREHOUSE', 'STORE'];
    }
    async bulkDelete(ids) {
        this.logger.log(`Bulk deleting ${ids.length} locations`);
        const locationsWithStock = await this.prisma.location.findMany({
            where: {
                id: { in: ids },
                stockBalances: {
                    some: {}
                }
            },
            select: { id: true, name: true }
        });
        if (locationsWithStock.length > 0) {
            const locationNames = locationsWithStock.map(l => l.name);
            throw new common_1.ConflictException(`Cannot delete locations with existing stock: ${locationNames.join(', ')}`);
        }
        const deletedLocations = await this.prisma.location.deleteMany({
            where: { id: { in: ids } },
        });
        this.logger.log(`Bulk deleted ${deletedLocations.count} locations`);
        return { count: deletedLocations.count, message: 'Locations deleted successfully' };
    }
};
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = LocationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LocationsService);
//# sourceMappingURL=locations.service.js.map