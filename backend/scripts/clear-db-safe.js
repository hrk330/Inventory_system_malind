"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const readline = __importStar(require("readline"));
const prisma = new client_1.PrismaClient();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}
async function clearDatabase() {
    console.log('🧹 Database Cleanup Tool');
    console.log('⚠️  This will delete ALL data except users!');
    console.log('');
    try {
        const counts = await Promise.all([
            prisma.auditLog.count(),
            prisma.stockTransaction.count(),
            prisma.stockBalance.count(),
            prisma.stocktake.count(),
            prisma.product.count(),
            prisma.location.count(),
            prisma.user.count()
        ]);
        console.log('📊 Current database contents:');
        console.log(`   - Audit logs: ${counts[0]}`);
        console.log(`   - Stock transactions: ${counts[1]}`);
        console.log(`   - Stock balances: ${counts[2]}`);
        console.log(`   - Stocktake entries: ${counts[3]}`);
        console.log(`   - Products: ${counts[4]}`);
        console.log(`   - Locations: ${counts[5]}`);
        console.log(`   - Users: ${counts[6]} (WILL BE PRESERVED)`);
        console.log('');
    }
    catch (error) {
        console.error('❌ Error reading database counts:', error);
        return;
    }
    const confirm1 = await askQuestion('Are you sure you want to delete all this data? (yes/no): ');
    if (confirm1.toLowerCase() !== 'yes') {
        console.log('❌ Operation cancelled');
        rl.close();
        return;
    }
    const confirm2 = await askQuestion('Type "DELETE" to confirm: ');
    if (confirm2 !== 'DELETE') {
        console.log('❌ Operation cancelled - confirmation text did not match');
        rl.close();
        return;
    }
    console.log('');
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
        console.log('');
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
        rl.close();
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
//# sourceMappingURL=clear-db-safe.js.map