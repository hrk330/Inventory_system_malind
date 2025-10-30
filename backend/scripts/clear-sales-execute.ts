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

    console.log('🗑️  Starting deletion process...');

    // First, reset customer balances and totalPurchases
    console.log('🔄 Resetting customer balances...');
    const updatedCustomers = await prisma.customer.updateMany({
      data: {
        balance: 0,
        totalPurchases: 0,
        lastPurchaseDate: null,
      },
    });
    console.log(`✅ Reset ${updatedCustomers.count} customers`);

    // Delete all sales (cascade will handle related records)
    console.log('🗑️  Deleting all sales...');
    const deletedSales = await prisma.sale.deleteMany({});
    console.log(`✅ Deleted ${deletedSales.count} sales`);

    // Verify deletion
    const remainingSales = await prisma.sale.count();
    const remainingItems = await prisma.saleItem.count();
    const remainingPayments = await prisma.payment.count();
    const remainingCustomerPayments = await prisma.customerPayment.count();
    const remainingRefunds = await prisma.saleRefund.count();

    console.log('');
    console.log('✅ Deletion completed successfully!');
    console.log('📊 Remaining data counts:');
    console.log(`- Sales: ${remainingSales}`);
    console.log(`- Sale Items: ${remainingItems}`);
    console.log(`- Payments: ${remainingPayments}`);
    console.log(`- Customer Payments: ${remainingCustomerPayments}`);
    console.log(`- Sale Refunds: ${remainingRefunds}`);
    console.log('');
    console.log('🎉 All sales and related data have been successfully removed!');

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
