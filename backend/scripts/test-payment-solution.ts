import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPaymentSolution() {
  console.log('🧪 Testing Payment Solution...\n');

  try {
    // Test 1: Check Hamza's supplier ledger before migration
    console.log('1️⃣ BEFORE MIGRATION - Hamza Supplier Ledger:');
    console.log('='.repeat(60));
    
    const hamzaSupplier = await prisma.supplier.findFirst({
      where: { email: 'hamza@gmail.com' }
    });

    if (!hamzaSupplier) {
      console.log('❌ Hamza supplier not found');
      return;
    }

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: { supplierId: hamzaSupplier.id },
      include: { payments: true }
    });

    const totalPurchases = purchaseOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const totalAmountPaid = purchaseOrders.reduce((sum, order) => sum + Number(order.amountPaid), 0);
    const totalPayments = purchaseOrders.reduce((sum, order) => 
      sum + order.payments.reduce((paymentSum, payment) => paymentSum + Number(payment.amount), 0), 0
    );

    console.log(`Total Purchases: $${totalPurchases.toFixed(2)}`);
    console.log(`Amount Paid (from orders): $${totalAmountPaid.toFixed(2)}`);
    console.log(`Total Payments (from records): $${totalPayments.toFixed(2)}`);
    console.log(`Discrepancy: $${(totalAmountPaid - totalPayments).toFixed(2)}`);
    console.log('');

    // Test 2: Run migration
    console.log('2️⃣ RUNNING MIGRATION...');
    console.log('='.repeat(60));
    
    // Import and run the migration
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      const { stdout, stderr } = await execAsync('npx ts-node scripts/migrate-historical-payments.ts');
      console.log(stdout);
      if (stderr) console.log(stderr);
    } catch (error) {
      console.log('Migration output:', error.stdout);
      if (error.stderr) console.log('Migration errors:', error.stderr);
    }

    // Test 3: Check Hamza's supplier ledger after migration
    console.log('\n3️⃣ AFTER MIGRATION - Hamza Supplier Ledger:');
    console.log('='.repeat(60));
    
    const purchaseOrdersAfter = await prisma.purchaseOrder.findMany({
      where: { supplierId: hamzaSupplier.id },
      include: { payments: true }
    });

    const totalPurchasesAfter = purchaseOrdersAfter.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const totalAmountPaidAfter = purchaseOrdersAfter.reduce((sum, order) => sum + Number(order.amountPaid), 0);
    const totalPaymentsAfter = purchaseOrdersAfter.reduce((sum, order) => 
      sum + order.payments.reduce((paymentSum, payment) => paymentSum + Number(payment.amount), 0), 0
    );

    console.log(`Total Purchases: $${totalPurchasesAfter.toFixed(2)}`);
    console.log(`Amount Paid (from orders): $${totalAmountPaidAfter.toFixed(2)}`);
    console.log(`Total Payments (from records): $${totalPaymentsAfter.toFixed(2)}`);
    console.log(`Discrepancy: $${(totalAmountPaidAfter - totalPaymentsAfter).toFixed(2)}`);
    console.log('');

    // Test 4: Test the hybrid ledger calculation
    console.log('4️⃣ TESTING HYBRID LEDGER CALCULATION:');
    console.log('='.repeat(60));
    
    const hybridTotalPaid = Math.max(totalPaymentsAfter, totalAmountPaidAfter);
    console.log(`Hybrid Total Paid: $${hybridTotalPaid.toFixed(2)}`);
    console.log(`Expected (should match amountPaid): $${totalAmountPaidAfter.toFixed(2)}`);
    console.log(`✅ Match: ${Math.abs(hybridTotalPaid - totalAmountPaidAfter) < 0.01 ? 'YES' : 'NO'}`);
    console.log('');

    // Test 5: Show payment records
    console.log('5️⃣ PAYMENT RECORDS:');
    console.log('='.repeat(60));
    
    for (const order of purchaseOrdersAfter) {
      console.log(`Order: ${order.orderNumber}`);
      console.log(`  Amount Paid: $${Number(order.amountPaid).toFixed(2)}`);
      console.log(`  Payment Records: ${order.payments.length}`);
      order.payments.forEach((payment, index) => {
        console.log(`    ${index + 1}. $${Number(payment.amount).toFixed(2)} - ${payment.paymentMethod} - ${payment.referenceNumber || 'N/A'}`);
      });
      console.log('');
    }

    console.log('🎉 Testing completed!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testPaymentSolution()
  .then(() => {
    console.log('Test completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
