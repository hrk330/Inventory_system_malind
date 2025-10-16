import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting minimal seed (users only)...');

  // Create users only
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@inventory.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@inventory.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@inventory.com' },
    update: {},
    create: {
      name: 'Staff User',
      email: 'staff@inventory.com',
      passwordHash: staffPassword,
      role: 'STAFF',
    },
  });

  console.log('✅ Users created successfully!');
  console.log('🎉 Minimal seed completed!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin: admin@inventory.com / admin123');
  console.log('Staff: staff@inventory.com / staff123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
