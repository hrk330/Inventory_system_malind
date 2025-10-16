import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDatabase() {
  console.log('🧹 Starting database cleanup...')
  
  try {
    // Delete in order to respect foreign key constraints
    
    // 1. Delete audit logs first (references users)
    console.log('🗑️ Deleting audit logs...')
    const deletedAuditLogs = await prisma.auditLog.deleteMany({})
    console.log(`✅ Deleted ${deletedAuditLogs.count} audit logs`)
    
    // 2. Delete stock transactions (references products and locations)
    console.log('🗑️ Deleting stock transactions...')
    const deletedTransactions = await prisma.stockTransaction.deleteMany({})
    console.log(`✅ Deleted ${deletedTransactions.count} stock transactions`)
    
    // 3. Delete stock balances (references products and locations)
    console.log('🗑️ Deleting stock balances...')
    const deletedBalances = await prisma.stockBalance.deleteMany({})
    console.log(`✅ Deleted ${deletedBalances.count} stock balances`)
    
    // 4. Delete stocktake entries (references products and locations)
    console.log('🗑️ Deleting stocktake entries...')
    const deletedStocktake = await prisma.stocktake.deleteMany({})
    console.log(`✅ Deleted ${deletedStocktake.count} stocktake entries`)
    
    // 5. Delete products (references locations)
    console.log('🗑️ Deleting products...')
    const deletedProducts = await prisma.product.deleteMany({})
    console.log(`✅ Deleted ${deletedProducts.count} products`)
    
    // 6. Delete locations
    console.log('🗑️ Deleting locations...')
    const deletedLocations = await prisma.location.deleteMany({})
    console.log(`✅ Deleted ${deletedLocations.count} locations`)
    
    // 7. Keep users - don't delete them
    console.log('👥 Users preserved (not deleted)')
    
    console.log('🎉 Database cleanup completed successfully!')
    console.log('📊 Summary:')
    console.log(`   - Audit logs: ${deletedAuditLogs.count}`)
    console.log(`   - Stock transactions: ${deletedTransactions.count}`)
    console.log(`   - Stock balances: ${deletedBalances.count}`)
    console.log(`   - Stocktake entries: ${deletedStocktake.count}`)
    console.log(`   - Products: ${deletedProducts.count}`)
    console.log(`   - Locations: ${deletedLocations.count}`)
    console.log(`   - Users: PRESERVED`)
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
clearDatabase()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
