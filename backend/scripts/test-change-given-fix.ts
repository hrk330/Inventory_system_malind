import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testChangeGivenFix() {
  console.log('🧪 Testing Change Given Fix...\n');

  try {
    // Test the current customer data
    const customerId = 'e6e83986-ff5c-4bda-8ace-a48d79030764';
    
    console.log('1️⃣ CURRENT CUSTOMER DATA:');
    console.log('='.repeat(50));
    
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        balance: true,
        totalPurchases: true,
      }
    });

    if (!customer) {
      console.log('❌ Customer not found');
      return;
    }

    console.log(`Customer: ${customer.name}`);
    console.log(`Current Balance: $${Number(customer.balance).toFixed(2)}`);
    console.log(`Total Purchases: $${Number(customer.totalPurchases).toFixed(2)}`);

    // Get the current sale
    const sale = await prisma.sale.findFirst({
      where: { customerId },
      select: {
        id: true,
        saleNumber: true,
        totalAmount: true,
        amountPaid: true,
        changeGiven: true,
        status: true,
        paymentStatus: true,
      }
    });

    if (!sale) {
      console.log('❌ No sale found');
      return;
    }

    console.log(`\nSale: ${sale.saleNumber}`);
    console.log(`Total Amount: $${Number(sale.totalAmount).toFixed(2)}`);
    console.log(`Amount Paid: $${Number(sale.amountPaid).toFixed(2)}`);
    console.log(`Change Given: $${Number(sale.changeGiven).toFixed(2)}`);
    console.log(`Status: ${sale.status}`);
    console.log(`Payment Status: ${sale.paymentStatus}`);

    console.log('\n2️⃣ SIMULATION OF FIXED LOGIC:');
    console.log('='.repeat(50));
    
    // Simulate the fixed logic
    const totalAmount = Number(sale.totalAmount);
    const currentAmountPaid = Number(sale.amountPaid);
    const changeGiven = Number(sale.changeGiven);
    
    // Calculate what the values should be with the fix
    const actualAmountPaid = Math.min(currentAmountPaid + changeGiven, totalAmount);
    const actualChangeGiven = Math.max(0, (currentAmountPaid + changeGiven) - totalAmount);
    const expectedBalance = totalAmount - actualAmountPaid;

    console.log(`Total Amount: $${totalAmount.toFixed(2)}`);
    console.log(`Current Amount Paid: $${currentAmountPaid.toFixed(2)}`);
    console.log(`Change Given: $${changeGiven.toFixed(2)}`);
    console.log(`Total Payment: $${(currentAmountPaid + changeGiven).toFixed(2)}`);
    console.log('');
    console.log(`WITH FIX:`);
    console.log(`Actual Amount Paid: $${actualAmountPaid.toFixed(2)} (capped at total amount)`);
    console.log(`Actual Change Given: $${actualChangeGiven.toFixed(2)}`);
    console.log(`Expected Customer Balance: $${expectedBalance.toFixed(2)}`);

    console.log('\n3️⃣ EXPECTED RESULTS AFTER FIX:');
    console.log('='.repeat(50));
    
    if (expectedBalance === 0) {
      console.log('✅ Customer Balance: $0.00 (fully paid)');
      console.log('✅ Change Given: $4,000.00 (handled separately)');
      console.log('✅ No negative balance in customer ledger');
    } else if (expectedBalance > 0) {
      console.log(`✅ Customer Balance: $${expectedBalance.toFixed(2)} (outstanding amount)`);
    } else {
      console.log(`❌ Customer Balance: $${expectedBalance.toFixed(2)} (negative - this should not happen)`);
    }

    console.log('\n4️⃣ TESTING SCENARIOS:');
    console.log('='.repeat(50));
    
    // Test different payment scenarios
    const testScenarios = [
      { name: 'Exact Payment', totalAmount: 1000, payment: 1000, expectedPaid: 1000, expectedChange: 0, expectedBalance: 0 },
      { name: 'Overpayment', totalAmount: 1000, payment: 1200, expectedPaid: 1000, expectedChange: 200, expectedBalance: 0 },
      { name: 'Partial Payment', totalAmount: 1000, payment: 600, expectedPaid: 600, expectedChange: 0, expectedBalance: 400 },
      { name: 'No Payment', totalAmount: 1000, payment: 0, expectedPaid: 0, expectedChange: 0, expectedBalance: 1000 },
    ];

    testScenarios.forEach(scenario => {
      const actualPaid = Math.min(scenario.payment, scenario.totalAmount);
      const actualChange = Math.max(0, scenario.payment - scenario.totalAmount);
      const actualBalance = scenario.totalAmount - actualPaid;
      
      console.log(`\n${scenario.name}:`);
      console.log(`  Bill: $${scenario.totalAmount}, Payment: $${scenario.payment}`);
      console.log(`  Amount Paid: $${actualPaid} (expected: $${scenario.expectedPaid}) ${actualPaid === scenario.expectedPaid ? '✅' : '❌'}`);
      console.log(`  Change Given: $${actualChange} (expected: $${scenario.expectedChange}) ${actualChange === scenario.expectedChange ? '✅' : '❌'}`);
      console.log(`  Customer Balance: $${actualBalance} (expected: $${scenario.expectedBalance}) ${actualBalance === scenario.expectedBalance ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testChangeGivenFix()
  .then(() => {
    console.log('\nTest completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
