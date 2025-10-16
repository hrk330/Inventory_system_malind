"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function clearDatabase() {
    console.log('🧹 Starting database cleanup...');
    try {
        console.log('🗑️ Deleting audit logs...');
        const deletedAuditLogs = await prisma.auditLog.deleteMany({});
        console.log(`✅ Deleted ${deletedAuditLogs.count} audit logs`);
        console.log('🗑️ Deleting stock transactions...');
        const deletedTransactions = await prisma.stockTransaction.deleteMany({});
        console.log(`✅ Deleted ${deletedTransactions.count} stock transactions`);
        console.log('🗑️ Deleting stock balances...');
        const deletedBalances = await prisma.stockBalance.deleteMany({});
        console.log(`✅ Deleted ${deletedBalances.count} stock balances`);
        console.log('🗑️ Deleting stocktake entries...');
        const deletedStocktake = await prisma.stocktake.deleteMany({});
        console.log(`✅ Deleted ${deletedStocktake.count} stocktake entries`);
        console.log('🗑️ Deleting products...');
        const deletedProducts = await prisma.product.deleteMany({});
        console.log(`✅ Deleted ${deletedProducts.count} products`);
        console.log('🗑️ Deleting locations...');
        const deletedLocations = await prisma.location.deleteMany({});
        console.log(`✅ Deleted ${deletedLocations.count} locations`);
        console.log('👥 Users preserved (not deleted)');
        console.log('🎉 Database cleanup completed successfully!');
        console.log('📊 Summary:');
        console.log(`   - Audit logs: ${deletedAuditLogs.count}`);
        console.log(`   - Stock transactions: ${deletedTransactions.count}`);
        console.log(`   - Stock balances: ${deletedBalances.count}`);
        console.log(`   - Stocktake entries: ${deletedStocktake.count}`);
        console.log(`   - Products: ${deletedProducts.count}`);
        console.log(`   - Locations: ${deletedLocations.count}`);
        console.log(`   - Users: PRESERVED`);
    }
    catch (error) {
        console.error('❌ Error during database cleanup:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
clearDatabase()
    .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
})
    .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=clear-db.js.map