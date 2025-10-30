import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAllSales() {
  console.log('🚨 WARNING: This will delete ALL sales and related data!');
  console.log('This includes:');
  console.log('- All Sales');
  console.log('- All Sale Items');
  console.log('- All Payments');
  console.log('- All Customer Payments');
  console.log('- All Sale Refunds');
  console.log('- Customer balances will be reset to 0');
  console.log('- Customer totalPurchases will be reset to 0');
  console.log('');

  try {
    // Get counts before deletion
    const salesCount = await prisma.sale.count();
    const saleItemsCount = await prisma.saleItem.count();
    const paymentsCount = await prisma.payment.count();
    const customerPaymentsCount = await prisma.customerPayment.count();
    const refundsCount = await prisma.saleRefund.count();

    console.log('📊 Current data counts:');
    console.log(`- Sales: ${salesCount}`);
    console.log(`- Sale Items: ${saleItemsCount}`);
    console.log(`- Payments: ${paymentsCount}`);
    console.log(`- Customer Payments: ${customerPaymentsCount}`);
    console.log(`- Sale Refunds: ${refundsCount}`);
    console.log('');

    if (salesCount === 0) {
      console.log('✅ No sales data found. Nothing to delete.');
      return;
    }

    // Confirm deletion
    console.log('⚠️  Are you sure you want to proceed? (This action cannot be undone)');
    console.log('Type "DELETE ALL SALES" to confirm:');
    
    // For safety, we'll require manual confirmation
    // In a real scenario, you might want to add readline or similar
    console.log('To proceed, uncomment the deletion code below and run again.');
    console.log('');

    // Uncomment the following lines to actually perform the deletion:
    /*
    console.log('🗑️  Starting deletion process...');

    // Delete in order to respect foreign key constraints
    // Note: Due to cascade deletes, we only need to delete the main Sale records
    // The related records will be automatically deleted

    // First, reset customer balances and totalPurchases
    console.log('🔄 Resetting customer balances...');
    await prisma.customer.updateMany({
      data: {
        balance: 0,
        totalPurchases: 0,
        lastPurchaseDate: null,
      },
    });

    // Delete all sales (cascade will handle related records)
    console.log('🗑️  Deleting all sales...');
    const deletedSales = await prisma.sale.deleteMany({});

    console.log('✅ Deletion completed successfully!');
    console.log(`- Deleted ${deletedSales.count} sales`);
    console.log('- All related data has been removed');
    console.log('- Customer balances have been reset');
    */

  } catch (error) {
    console.error('❌ Error during deletion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
clearAllSales()
  .then(() => {
    console.log('Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
