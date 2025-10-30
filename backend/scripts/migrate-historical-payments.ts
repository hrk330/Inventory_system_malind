import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateHistoricalPayments() {
  console.log('🔄 Migrating Historical Payment Data...\n');

  try {
    // Find all purchase orders that have amountPaid > 0 but no corresponding PurchasePayment records
    const purchaseOrdersWithPayments = await prisma.purchaseOrder.findMany({
      where: {
        amountPaid: {
          gt: 0
        }
      },
      include: {
        supplier: true,
        payments: true
      }
    });

    console.log(`📊 Found ${purchaseOrdersWithPayments.length} purchase orders with payments`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const order of purchaseOrdersWithPayments) {
      const existingPayments = order.payments;
      const totalExistingPayments = existingPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      const amountPaid = Number(order.amountPaid);
      
      console.log(`\n🔍 Processing Order: ${order.orderNumber}`);
      console.log(`   Amount Paid: $${amountPaid.toFixed(2)}`);
      console.log(`   Existing Payment Records: ${existingPayments.length} (Total: $${totalExistingPayments.toFixed(2)})`);

      // Check if we need to create missing payment records
      if (totalExistingPayments < amountPaid) {
        const missingAmount = amountPaid - totalExistingPayments;
        console.log(`   ⚠️  Missing Payment Amount: $${missingAmount.toFixed(2)}`);

        // Get the first available user ID for processedBy
        const firstUser = await prisma.user.findFirst({
          select: { id: true }
        });

        if (!firstUser) {
          console.log(`   ❌ No users found in database - cannot create payment record`);
          continue;
        }

        // Create a virtual payment record for the missing amount
        const virtualPayment = await prisma.purchasePayment.create({
          data: {
            purchaseOrderId: order.id,
            amount: missingAmount,
            paymentMethod: 'CASH', // Default to CASH for historical payments
            referenceNumber: `HISTORICAL-${order.orderNumber}`,
            notes: 'Historical payment - migrated from amountPaid field',
            processedBy: firstUser.id, // Use first available user ID
            paymentDate: order.orderDate, // Use order date as payment date
          }
        });

        console.log(`   ✅ Created virtual payment record: $${missingAmount.toFixed(2)}`);
        migratedCount++;
      } else if (totalExistingPayments === amountPaid) {
        console.log(`   ✅ Payment records already exist and match amountPaid`);
        skippedCount++;
      } else {
        console.log(`   ⚠️  Payment records exceed amountPaid - this needs manual review`);
        skippedCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Migrated: ${migratedCount} orders`);
    console.log(`⏭️  Skipped: ${skippedCount} orders`);

    // Verify the migration
    console.log('\n🔍 Verification:');
    const allOrders = await prisma.purchaseOrder.findMany({
      where: {
        amountPaid: {
          gt: 0
        }
      },
      include: {
        payments: true
      }
    });

    let discrepancies = 0;
    for (const order of allOrders) {
      const totalPayments = order.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      const amountPaid = Number(order.amountPaid);
      
      if (Math.abs(totalPayments - amountPaid) > 0.01) { // Allow for small rounding differences
        console.log(`   ⚠️  Discrepancy in ${order.orderNumber}: amountPaid=$${amountPaid.toFixed(2)}, payments=$${totalPayments.toFixed(2)}`);
        discrepancies++;
      }
    }

    if (discrepancies === 0) {
      console.log('✅ All payment records now match amountPaid values!');
    } else {
      console.log(`⚠️  Found ${discrepancies} discrepancies that need manual review`);
    }

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateHistoricalPayments()
  .then(() => {
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
