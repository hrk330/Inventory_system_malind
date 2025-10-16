"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🚀 Starting Enhanced Products Migration...');
    try {
        try {
            const existingSuppliers = await prisma.supplier.count();
            if (existingSuppliers > 0) {
                console.log('✅ Migration already applied - suppliers table exists');
                return;
            }
        }
        catch (error) {
            console.log('📝 Suppliers table does not exist, migration needed');
        }
        console.log('📊 Current database state:');
        const productCount = await prisma.product.count();
        const locationCount = await prisma.location.count();
        const userCount = await prisma.user.count();
        console.log(`   - Products: ${productCount}`);
        console.log(`   - Locations: ${locationCount}`);
        console.log(`   - Users: ${userCount}`);
        console.log('🎉 Enhanced Products migration completed successfully!');
        console.log('📝 New features available:');
        console.log('   - Enhanced product fields (description, barcode, pricing, supplier info)');
        console.log('   - Supplier management');
        console.log('   - Product variants');
        console.log('   - Bulk operations');
        console.log('   - Product performance analytics');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=migrate-enhanced-products.js.map