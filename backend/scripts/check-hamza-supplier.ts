import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkHamzaSupplier() {
  console.log('🔍 Investigating Hamza Supplier Payment Data...\n');

  try {
    // 1. Check Supplier Information
    console.log('1️⃣ SUPPLIER INFORMATION:');
    console.log('='.repeat(50));
    const suppliers = await prisma.supplier.findMany({
      where: {
        OR: [
          { email: 'hamza@gmail.com' },
          { name: { contains: 'hamza', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      }
    });
    
    if (suppliers.length === 0) {
      console.log('❌ No supplier found with email "hamza@gmail.com" or name containing "hamza"');
    } else {
      suppliers.forEach(supplier => {
        console.log(`✅ Found Supplier:`);
        console.log(`   ID: ${supplier.id}`);
        console.log(`   Name: ${supplier.name}`);
        console.log(`   Email: ${supplier.email}`);
        console.log(`   Phone: ${supplier.phone}`);
      });
    }
    console.log('');

    // 2. Check Purchase Orders for Hamza
    console.log('2️⃣ PURCHASE ORDERS:');
    console.log('='.repeat(50));
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        supplier: {
          OR: [
            { email: 'hamza@gmail.com' },
            { name: { contains: 'hamza', mode: 'insensitive' } }
          ]
        }
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        amountPaid: true,
        status: true,
        orderDate: true,
        supplier: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        orderDate: 'desc'
      }
    });

    if (purchaseOrders.length === 0) {
      console.log('❌ No purchase orders found for Hamza');
    } else {
      console.log(`✅ Found ${purchaseOrders.length} purchase order(s):`);
      purchaseOrders.forEach(order => {
        console.log(`   Order: ${order.orderNumber}`);
        console.log(`   Total Amount: $${Number(order.totalAmount).toFixed(2)}`);
        console.log(`   Amount Paid: $${Number(order.amountPaid).toFixed(2)}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Date: ${order.orderDate.toISOString().split('T')[0]}`);
        console.log(`   Supplier: ${order.supplier.name} (${order.supplier.email})`);
        console.log('');
      });
    }

    // 3. Check Purchase Payments for Hamza
    console.log('3️⃣ PURCHASE PAYMENTS:');
    console.log('='.repeat(50));
    const purchasePayments = await prisma.purchasePayment.findMany({
      where: {
        purchaseOrder: {
          supplier: {
            OR: [
              { email: 'hamza@gmail.com' },
              { name: { contains: 'hamza', mode: 'insensitive' } }
            ]
          }
        }
      },
      select: {
        id: true,
        amount: true,
        paymentMethod: true,
        paymentDate: true,
        referenceNumber: true,
        notes: true,
        purchaseOrder: {
          select: {
            orderNumber: true,
            supplier: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });

    if (purchasePayments.length === 0) {
      console.log('❌ No purchase payments found for Hamza');
    } else {
      console.log(`✅ Found ${purchasePayments.length} payment(s):`);
      purchasePayments.forEach(payment => {
        console.log(`   Payment ID: ${payment.id}`);
        console.log(`   Amount: $${Number(payment.amount).toFixed(2)}`);
        console.log(`   Method: ${payment.paymentMethod}`);
        console.log(`   Date: ${payment.paymentDate.toISOString().split('T')[0]}`);
        console.log(`   Reference: ${payment.referenceNumber || 'N/A'}`);
        console.log(`   Order: ${payment.purchaseOrder.orderNumber}`);
        console.log(`   Supplier: ${payment.purchaseOrder.supplier.name}`);
        console.log('');
      });
    }

    // 4. Check All Purchase Payments (to see if any exist at all)
    console.log('4️⃣ ALL PURCHASE PAYMENTS:');
    console.log('='.repeat(50));
    const allPaymentsCount = await prisma.purchasePayment.count();
    console.log(`Total purchase payments in database: ${allPaymentsCount}`);

    if (allPaymentsCount > 0) {
      const samplePayments = await prisma.purchasePayment.findMany({
        take: 3,
        select: {
          id: true,
          amount: true,
          paymentMethod: true,
          purchaseOrder: {
            select: {
              orderNumber: true,
              supplier: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          paymentDate: 'desc'
        }
      });

      console.log('Sample payments:');
      samplePayments.forEach(payment => {
        console.log(`   ${payment.purchaseOrder.orderNumber} - $${Number(payment.amount).toFixed(2)} (${payment.paymentMethod}) - ${payment.purchaseOrder.supplier.name}`);
      });
    }
    console.log('');

    // 5. Check Purchase Returns for Hamza
    console.log('5️⃣ PURCHASE RETURNS:');
    console.log('='.repeat(50));
    const purchaseReturns = await prisma.purchaseReturn.findMany({
      where: {
        purchaseOrder: {
          supplier: {
            OR: [
              { email: 'hamza@gmail.com' },
              { name: { contains: 'hamza', mode: 'insensitive' } }
            ]
          }
        }
      },
      select: {
        id: true,
        returnNumber: true,
        totalAmount: true,
        returnDate: true,
        reason: true,
        purchaseOrder: {
          select: {
            orderNumber: true,
            supplier: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        returnDate: 'desc'
      }
    });

    if (purchaseReturns.length === 0) {
      console.log('❌ No purchase returns found for Hamza');
    } else {
      console.log(`✅ Found ${purchaseReturns.length} return(s):`);
      purchaseReturns.forEach(returnItem => {
        console.log(`   Return: ${returnItem.returnNumber}`);
        console.log(`   Amount: $${Number(returnItem.totalAmount).toFixed(2)}`);
        console.log(`   Reason: ${returnItem.reason}`);
        console.log(`   Date: ${returnItem.returnDate.toISOString().split('T')[0]}`);
        console.log(`   Order: ${returnItem.purchaseOrder.orderNumber}`);
        console.log(`   Supplier: ${returnItem.purchaseOrder.supplier.name}`);
        console.log('');
      });
    }

    // 6. Summary
    console.log('6️⃣ SUMMARY:');
    console.log('='.repeat(50));
    const totalPurchases = purchaseOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const totalPaid = purchaseOrders.reduce((sum, order) => sum + Number(order.amountPaid), 0);
    const totalReturns = purchaseReturns.reduce((sum, returnItem) => sum + Number(returnItem.totalAmount), 0);
    const actualPayments = purchasePayments.reduce((sum, payment) => sum + Number(payment.amount), 0);

    console.log(`Total Purchase Orders: ${purchaseOrders.length}`);
    console.log(`Total Purchase Amount: $${totalPurchases.toFixed(2)}`);
    console.log(`Total Amount Paid (from orders): $${totalPaid.toFixed(2)}`);
    console.log(`Total Actual Payments (from payment records): $${actualPayments.toFixed(2)}`);
    console.log(`Total Returns: $${totalReturns.toFixed(2)}`);
    console.log(`Current Balance: $${(totalPurchases - totalPaid - totalReturns).toFixed(2)}`);
    console.log('');

    if (totalPaid !== actualPayments) {
      console.log('⚠️  DISCREPANCY FOUND:');
      console.log(`   Order amountPaid: $${totalPaid.toFixed(2)}`);
      console.log(`   Actual payment records: $${actualPayments.toFixed(2)}`);
      console.log(`   Difference: $${(totalPaid - actualPayments).toFixed(2)}`);
    }

  } catch (error) {
    console.error('❌ Error during investigation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
checkHamzaSupplier()
  .then(() => {
    console.log('Investigation completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
