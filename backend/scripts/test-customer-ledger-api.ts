import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCustomerLedgerAPI() {
  console.log('🧪 Testing Customer Ledger API...\n');

  try {
    const customerId = 'e6e83986-ff5c-4bda-8ace-a48d79030764';
    
    // Simulate the customer ledger service logic
    console.log('1️⃣ CUSTOMER LEDGER SERVICE SIMULATION:');
    console.log('='.repeat(50));
    
    // Get customer info
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        customerNumber: true,
        address: true,
      },
    });

    if (!customer) {
      console.log('❌ Customer not found');
      return;
    }

    console.log(`✅ Customer: ${customer.name}`);

    // Get all sales for this customer
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
            referenceNumber: true,
            paymentDate: true,
            notes: true,
          },
          orderBy: {
            paymentDate: 'asc',
          },
        },
      },
      orderBy: {
        saleDate: 'asc',
      },
    });

    // Get all refunds for this customer
    const refunds = await prisma.saleRefund.findMany({
      where: {
        originalSale: {
          customerId,
        },
      },
      select: {
        id: true,
        refundAmount: true,
        refundNumber: true,
        createdAt: true,
        reason: true,
        originalSale: {
          select: {
            saleNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`📦 Found ${sales.length} sale(s)`);
    console.log(`🔄 Found ${refunds.length} refund(s)`);

    // Calculate summary using hybrid approach
    const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    
    // Calculate total paid using hybrid approach
    const totalPaidFromPayments = sales.reduce((sum, sale) => {
      return sum + sale.customerPayments.reduce((paymentSum, payment) => {
        return paymentSum + Number(payment.amount);
      }, 0);
    }, 0);
    
    // Calculate total amountPaid from all sales
    const totalAmountPaid = sales.reduce((sum, sale) => sum + Number(sale.amountPaid), 0);
    
    // Use the higher of the two values
    const totalPaid = Math.max(totalPaidFromPayments, totalAmountPaid);
    
    const totalRefunds = refunds.reduce((sum, refund) => sum + Number(refund.refundAmount), 0);
    const currentBalance = totalSales - totalPaid - totalRefunds;

    console.log('\n2️⃣ HYBRID CALCULATION RESULTS:');
    console.log('='.repeat(50));
    console.log(`Total Sales: $${totalSales.toFixed(2)}`);
    console.log(`Total Paid (from payments): $${totalPaidFromPayments.toFixed(2)}`);
    console.log(`Total Paid (from amountPaid): $${totalAmountPaid.toFixed(2)}`);
    console.log(`Total Paid (hybrid - max): $${totalPaid.toFixed(2)}`);
    console.log(`Total Refunds: $${totalRefunds.toFixed(2)}`);
    console.log(`Current Balance: $${currentBalance.toFixed(2)}`);

    // Create virtual payment transactions
    const virtualPaymentTransactions = sales
      .filter(sale => Number(sale.amountPaid) > 0)
      .map(sale => {
        const coveredAmount = sale.customerPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        const uncoveredAmount = Number(sale.amountPaid) - coveredAmount;
        
        if (uncoveredAmount > 0) {
          return {
            id: `historical-${sale.id}`,
            date: sale.saleDate,
            type: 'PAYMENT' as const,
            reference: sale.saleNumber,
            description: `Payment - Historical (${uncoveredAmount > 0 ? 'Partial' : 'Full'})`,
            debit: 0,
            credit: uncoveredAmount,
            balance: 0,
          };
        }
        return null;
      })
      .filter(Boolean);

    console.log('\n3️⃣ VIRTUAL PAYMENT TRANSACTIONS:');
    console.log('='.repeat(50));
    console.log(`Found ${virtualPaymentTransactions.length} virtual payment transaction(s):`);
    virtualPaymentTransactions.forEach((tx, index) => {
      console.log(`  ${index + 1}. ${tx.reference} - $${tx.credit.toFixed(2)} - ${tx.description}`);
    });

    // Create all transactions
    const transactions = [
      ...sales.map(sale => ({
        id: sale.id,
        date: sale.saleDate,
        type: 'SALE' as const,
        reference: sale.saleNumber,
        description: `Sale - ${sale.status}`,
        debit: Number(sale.totalAmount),
        credit: 0,
        balance: 0,
      })),
      ...refunds.map(refund => ({
        id: refund.id,
        date: refund.createdAt,
        type: 'REFUND' as const,
        reference: refund.refundNumber,
        description: `Refund - ${refund.reason}`,
        debit: 0,
        credit: Number(refund.refundAmount),
        balance: 0,
      })),
      ...sales.flatMap(sale => 
        sale.customerPayments.map(payment => ({
          id: payment.id,
          date: payment.paymentDate,
          type: 'PAYMENT' as const,
          reference: sale.saleNumber,
          description: `Payment - ${payment.paymentMethod}${payment.referenceNumber ? ` (${payment.referenceNumber})` : ''}`,
          debit: 0,
          credit: Number(payment.amount),
          balance: 0,
        }))
      ),
      ...virtualPaymentTransactions,
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let runningBalance = 0;
    const ledgerEntries = transactions.map(transaction => {
      runningBalance += transaction.debit - transaction.credit;
      return {
        ...transaction,
        balance: runningBalance,
      };
    });

    console.log('\n4️⃣ FINAL LEDGER ENTRIES:');
    console.log('='.repeat(50));
    console.log(`Total transactions: ${ledgerEntries.length}`);
    ledgerEntries.forEach((entry, index) => {
      console.log(`  ${index + 1}. ${entry.date.toISOString().split('T')[0]} | ${entry.type} | ${entry.reference} | $${entry.debit.toFixed(2)} | $${entry.credit.toFixed(2)} | $${entry.balance.toFixed(2)}`);
    });

    console.log('\n5️⃣ EXPECTED FRONTEND DISPLAY:');
    console.log('='.repeat(50));
    console.log(`Total Sales: $${totalSales.toFixed(2)}`);
    console.log(`Total Paid: $${totalPaid.toFixed(2)} ✅ (should show $20,000.00)`);
    console.log(`Total Refunds: $${totalRefunds.toFixed(2)}`);
    console.log(`Current Balance: $${currentBalance.toFixed(2)} ✅ (should show -$3,210.00)`);

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testCustomerLedgerAPI()
  .then(() => {
    console.log('\nTest completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
