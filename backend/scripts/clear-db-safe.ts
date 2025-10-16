import { PrismaClient } from '@prisma/client'
import * as readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

async function clearDatabase() {
  console.log('🧹 Database Cleanup Tool')
  console.log('⚠️  This will delete ALL data except users!')
  console.log('')
  
  // Show what will be deleted
  try {
    const counts = await Promise.all([
      prisma.auditLog.count(),
      prisma.stockTransaction.count(),
      prisma.stockBalance.count(),
      prisma.stocktake.count(),
      prisma.product.count(),
      prisma.location.count(),
      prisma.user.count()
    ])
    
    console.log('📊 Current database contents:')
    console.log(`   - Audit logs: ${counts[0]}`)
    console.log(`   - Stock transactions: ${counts[1]}`)
    console.log(`   - Stock balances: ${counts[2]}`)
    console.log(`   - Stocktake entries: ${counts[3]}`)
    console.log(`   - Products: ${counts[4]}`)
    console.log(`   - Locations: ${counts[5]}`)
    console.log(`   - Users: ${counts[6]} (WILL BE PRESERVED)`)
    console.log('')
  } catch (error) {
    console.error('❌ Error reading database counts:', error)
    return
  }
  
  // Ask for confirmation
  const confirm1 = await askQuestion('Are you sure you want to delete all this data? (yes/no): ')
  
  if (confirm1.toLowerCase() !== 'yes') {
    console.log('❌ Operation cancelled')
    rl.close()
    return
  }
  
  const confirm2 = await askQuestion('Type "DELETE" to confirm: ')
  
  if (confirm2 !== 'DELETE') {
    console.log('❌ Operation cancelled - confirmation text did not match')
    rl.close()
    return
  }
  
  console.log('')
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
    
    console.log('')
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
    rl.close()
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
