import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCategories() {
  console.log('🔄 Starting category migration...');

  try {
    // Check if there are any existing categories
    const existingCategories = await prisma.category.findMany();
    console.log(`📋 Found ${existingCategories.length} existing categories`);

    if (existingCategories.length > 0) {
      console.log('ℹ️  Categories already exist. Migration may have already been run.');
      console.log('📊 Existing categories:', existingCategories.map(c => c.name));
      return;
    }

    // Since the schema has been updated, we need to check if there are any products
    // that might have been created before the migration
    const products = await prisma.product.findMany({
      select: { 
        id: true, 
        name: true, 
        categoryId: true 
      },
    });

    console.log(`📋 Found ${products.length} products`);

    // Check if any products have categoryId set
    const productsWithCategories = products.filter(p => p.categoryId);
    console.log(`📋 Found ${productsWithCategories.length} products with categories`);

    if (productsWithCategories.length === 0) {
      console.log('ℹ️  No products with categories found. Creating some default categories...');
      
      // Create some default categories
      const defaultCategories = [
        'Electronics',
        'Clothing',
        'Food & Beverage',
        'Books',
        'Toys',
        'Home & Garden',
        'Sports',
        'Health & Beauty',
        'Automotive',
        'Office Supplies'
      ];

      const createdCategories = [];
      for (const categoryName of defaultCategories) {
        try {
          const category = await prisma.category.create({
            data: {
              name: categoryName,
              description: `Default category: ${categoryName}`,
              isActive: true,
            },
          });
          createdCategories.push(category);
          console.log(`✅ Created default category: ${categoryName} (ID: ${category.id})`);
        } catch (error) {
          console.error(`❌ Error creating category ${categoryName}:`, error.message);
        }
      }

      console.log('🎉 Default categories created successfully!');
      console.log(`📊 Summary:`);
      console.log(`   - Created ${createdCategories.length} default categories`);
      return;
    }

    console.log('🎉 Category migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Found ${productsWithCategories.length} products with existing categories`);
    console.log(`   - No migration needed as categories are already properly set up`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateCategories()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateCategories };
