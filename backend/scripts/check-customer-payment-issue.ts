import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCustomerPaymentIssue() {
  console.log('🔍 Investigating Customer Payment Issue...\n');

  try {
    // Get the customer from the URL parameter
    const customerId = 'e6e83986-ff5c-4bda-8ace-a48d79030764';
    
    console.log('1️⃣ CUSTOMER INFORMATION:');
    console.log('='.repeat(50));
    
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        customerNumber: true,
        balance: true,
        totalPurchases: true,
      }
    });

    if (!customer) {
      console.log('❌ Customer not found');
      return;
    }

    console.log(`✅ Customer: ${customer.name}`);
    console.log(`   ID: ${customer.id}`);
    console.log(`   Email: ${customer.email || 'N/A'}`);
    console.log(`   Phone: ${customer.phone || 'N/A'}`);
    console.log(`   Customer Number: ${customer.customerNumber}`);
    console.log(`   Balance (from DB): $${Number(customer.balance || 0).toFixed(2)}`);
    console.log(`   Total Purchases (from DB): $${Number(customer.totalPurchases || 0).toFixed(2)}`);
    console.log('');

    // Get all sales for this customer
    console.log('2️⃣ SALES DATA:');
    console.log('='.repeat(50));
    
    const sales = await prisma.sale.findMany({
      where: { customerId },
      select: {
        id: true,
        saleNumber: true,
        saleDate: true,
        totalAmount: true,
        amountPaid: true,
        status: true,
        paymentStatus: true,
        customerPayments: {
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
            paymentDate: true,
            referenceNumber: true,
            notes: true,
          },
          orderBy: {
            paymentDate: 'asc',
          },
        },
      },
      orderBy: {
        saleDate: 'desc',
      },
    });

    console.log(`📦 Found ${sales.length} sale(s):`);
    
    let totalSales = 0;
    let totalAmountPaid = 0;
    let totalPayments = 0;

    for (const sale of sales) {
      console.log(`\n   Sale: ${sale.saleNumber}`);
      console.log(`   Date: ${sale.saleDate.toISOString().split('T')[0]}`);
      console.log(`   Total Amount: $${Number(sale.totalAmount).toFixed(2)}`);
      console.log(`   Amount Paid (from sale): $${Number(sale.amountPaid).toFixed(2)}`);
      console.log(`   Status: ${sale.status}`);
      console.log(`   Payment Status: ${sale.paymentStatus}`);
      console.log(`   Payment Records: ${sale.customerPayments.length}`);
      
      if (sale.customerPayments.length > 0) {
        sale.customerPayments.forEach((payment, index) => {
          console.log(`     ${index + 1}. $${Number(payment.amount).toFixed(2)} - ${payment.paymentMethod} - ${payment.paymentDate.toISOString().split('T')[0]}`);
        });
      } else {
        console.log(`     No payment records found`);
      }

      totalSales += Number(sale.totalAmount);
      totalAmountPaid += Number(sale.amountPaid);
      totalPayments += sale.customerPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    }

    console.log('\n3️⃣ SUMMARY CALCULATIONS:');
    console.log('='.repeat(50));
    console.log(`Total Sales: $${totalSales.toFixed(2)}`);
    console.log(`Total Amount Paid (from sales): $${totalAmountPaid.toFixed(2)}`);
    console.log(`Total Payments (from records): $${totalPayments.toFixed(2)}`);
    console.log(`Current Balance (calculated): $${(totalSales - totalPayments).toFixed(2)}`);
    console.log('');

    // Check for discrepancies
    console.log('4️⃣ DISCREPANCY ANALYSIS:');
    console.log('='.repeat(50));
    
    if (Math.abs(totalAmountPaid - totalPayments) > 0.01) {
      console.log(`⚠️  DISCREPANCY FOUND:`);
      console.log(`   Amount Paid (from sales): $${totalAmountPaid.toFixed(2)}`);
      console.log(`   Payment Records: $${totalPayments.toFixed(2)}`);
      console.log(`   Difference: $${(totalAmountPaid - totalPayments).toFixed(2)}`);
    } else {
      console.log(`✅ Amount Paid matches Payment Records`);
    }

    if (Math.abs(Number(customer.balance) - (totalSales - totalPayments)) > 0.01) {
      console.log(`⚠️  BALANCE DISCREPANCY:`);
      console.log(`   Customer Balance (DB): $${Number(customer.balance).toFixed(2)}`);
      console.log(`   Calculated Balance: $${(totalSales - totalPayments).toFixed(2)}`);
      console.log(`   Difference: $${(Number(customer.balance) - (totalSales - totalPayments)).toFixed(2)}`);
    } else {
      console.log(`✅ Customer Balance matches calculated balance`);
    }

    // Check if this is a completed sale with no payment
    console.log('\n5️⃣ SALE STATUS ANALYSIS:');
    console.log('='.repeat(50));
    
    for (const sale of sales) {
      if (sale.status === 'COMPLETED' && Number(sale.amountPaid) === 0) {
        console.log(`⚠️  COMPLETED SALE WITH NO PAYMENT: ${sale.saleNumber}`);
        console.log(`   This sale is marked as COMPLETED but has no payment records`);
        console.log(`   This could be a walk-in cash sale that wasn't properly recorded`);
      } else if (sale.status === 'CREDIT' && Number(sale.amountPaid) === 0) {
        console.log(`✅ CREDIT SALE: ${sale.saleNumber}`);
        console.log(`   This is a credit sale - customer owes $${Number(sale.totalAmount).toFixed(2)}`);
      } else if (sale.status === 'COMPLETED' && Number(sale.amountPaid) > 0) {
        console.log(`✅ PAID SALE: ${sale.saleNumber}`);
        console.log(`   This sale was paid for - amount: $${Number(sale.amountPaid).toFixed(2)}`);
      }
    }

  } catch (error) {
    console.error('❌ Error during investigation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the investigation
checkCustomerPaymentIssue()
  .then(() => {
    console.log('\nInvestigation completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Investigation failed:', error);
    process.exit(1);
  });
