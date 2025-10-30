import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixExistingSaleData() {
  console.log('🔧 Fixing Existing Sale Data...\n');

  try {
    // Find the problematic sale
    const sale = await prisma.sale.findFirst({
      where: {
        saleNumber: 'POS-20251029-0001'
      },
      select: {
        id: true,
        saleNumber: true,
        totalAmount: true,
        amountPaid: true,
        changeGiven: true,
        status: true,
        paymentStatus: true,
        customerId: true,
      }
    });

    if (!sale) {
      console.log('❌ Sale not found');
      return;
    }

    console.log('1️⃣ CURRENT SALE DATA:');
    console.log('='.repeat(50));
    console.log(`Sale: ${sale.saleNumber}`);
    console.log(`Total Amount: $${Number(sale.totalAmount).toFixed(2)}`);
    console.log(`Amount Paid: $${Number(sale.amountPaid).toFixed(2)}`);
    console.log(`Change Given: $${Number(sale.changeGiven).toFixed(2)}`);
    console.log(`Status: ${sale.status}`);
    console.log(`Payment Status: ${sale.paymentStatus}`);

    // Calculate correct values
    const totalAmount = Number(sale.totalAmount);
    const currentAmountPaid = Number(sale.amountPaid);
    const currentChangeGiven = Number(sale.changeGiven);
    
    // The correct amountPaid should be capped at totalAmount
    const correctAmountPaid = Math.min(currentAmountPaid, totalAmount);
    const correctChangeGiven = Math.max(0, currentAmountPaid - totalAmount);

    console.log('\n2️⃣ CORRECTED VALUES:');
    console.log('='.repeat(50));
    console.log(`Total Amount: $${totalAmount.toFixed(2)}`);
    console.log(`Amount Paid (corrected): $${correctAmountPaid.toFixed(2)} (was $${currentAmountPaid.toFixed(2)})`);
    console.log(`Change Given (corrected): $${correctChangeGiven.toFixed(2)} (was $${currentChangeGiven.toFixed(2)})`);

    // Update the sale
    console.log('\n3️⃣ UPDATING SALE...');
    console.log('='.repeat(50));
    
    const updatedSale = await prisma.sale.update({
      where: { id: sale.id },
      data: {
        amountPaid: correctAmountPaid,
        changeGiven: correctChangeGiven,
      }
    });

    console.log('✅ Sale updated successfully');

    // Update customer balance if customer exists
    if (sale.customerId) {
      console.log('\n4️⃣ UPDATING CUSTOMER BALANCE...');
      console.log('='.repeat(50));
      
      // Get current customer data
      const customer = await prisma.customer.findUnique({
        where: { id: sale.customerId },
        select: {
          id: true,
          name: true,
          balance: true,
        }
      });

      if (customer) {
        console.log(`Customer: ${customer.name}`);
        console.log(`Current Balance: $${Number(customer.balance).toFixed(2)}`);

        // Calculate the difference in amountPaid
        const amountPaidDifference = currentAmountPaid - correctAmountPaid;
        console.log(`Amount Paid Difference: $${amountPaidDifference.toFixed(2)}`);

        // Update customer balance
        const updatedCustomer = await prisma.customer.update({
          where: { id: sale.customerId },
          data: {
            balance: {
              increment: amountPaidDifference // Add back the overpayment amount
            }
          }
        });

        console.log(`Updated Balance: $${Number(updatedCustomer.balance).toFixed(2)}`);
        console.log('✅ Customer balance updated successfully');
      }
    }

    console.log('\n5️⃣ VERIFICATION:');
    console.log('='.repeat(50));
    
    // Verify the changes
    const verifySale = await prisma.sale.findUnique({
      where: { id: sale.id },
      select: {
        saleNumber: true,
        totalAmount: true,
        amountPaid: true,
        changeGiven: true,
      }
    });

    console.log(`Sale: ${verifySale.saleNumber}`);
    console.log(`Total Amount: $${Number(verifySale.totalAmount).toFixed(2)}`);
    console.log(`Amount Paid: $${Number(verifySale.amountPaid).toFixed(2)}`);
    console.log(`Change Given: $${Number(verifySale.changeGiven).toFixed(2)}`);

    // Calculate expected customer balance
    const expectedBalance = Number(verifySale.totalAmount) - Number(verifySale.amountPaid);
    console.log(`Expected Customer Balance: $${expectedBalance.toFixed(2)}`);

    if (expectedBalance === 0) {
      console.log('✅ Customer should now have $0.00 balance');
    } else {
      console.log(`⚠️  Customer balance should be $${expectedBalance.toFixed(2)}`);
    }

  } catch (error) {
    console.error('❌ Error during fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixExistingSaleData()
  .then(() => {
    console.log('\nFix completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fix failed:', error);
    process.exit(1);
  });
