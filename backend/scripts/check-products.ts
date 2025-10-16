import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  console.log('🔍 Checking all products in database...\n');
  
  // Get all products
  const allProducts = await prisma.product.findMany({
    include: {
      uom: {
        select: {
          id: true,
          name: true,
          symbol: true
        }
      },
      category: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`📊 Total products found: ${allProducts.length}\n`);

  // Group by active/inactive
  const activeProducts = allProducts.filter(p => p.isActive);
  const inactiveProducts = allProducts.filter(p => !p.isActive);

  console.log(`✅ Active products: ${activeProducts.length}`);
  console.log(`❌ Inactive products: ${inactiveProducts.length}\n`);

  // Show active products
  if (activeProducts.length > 0) {
    console.log('📋 Active Products:');
    activeProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.sku}) - ${product.uom.symbol} - ${product.category?.name || 'No category'}`);
    });
    console.log('');
  }

  // Show inactive products
  if (inactiveProducts.length > 0) {
    console.log('📋 Inactive Products:');
    inactiveProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.sku}) - ${product.uom.symbol} - ${product.category?.name || 'No category'}`);
    });
    console.log('');
  }

  // Group by UOM
  const productsByUOM = allProducts.reduce((acc, product) => {
    const uomSymbol = product.uom.symbol;
    if (!acc[uomSymbol]) {
      acc[uomSymbol] = { active: 0, inactive: 0, total: 0 };
    }
    acc[uomSymbol].total++;
    if (product.isActive) {
      acc[uomSymbol].active++;
    } else {
      acc[uomSymbol].inactive++;
    }
    return acc;
  }, {} as Record<string, { active: number; inactive: number; total: number }>);

  console.log('📊 Products by UOM:');
  Object.entries(productsByUOM).forEach(([uom, counts]) => {
    console.log(`${uom}: ${counts.active} active, ${counts.inactive} inactive, ${counts.total} total`);
  });

  await prisma.$disconnect();
}

checkProducts().catch(console.error);
