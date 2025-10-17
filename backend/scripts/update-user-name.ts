import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserName() {
  try {
    console.log('🔐 Updating user name...');
    
    const email = 'admin@gmail.com';
    const newName = 'Test Admin';
    
    // Find the user
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!existingUser) {
      console.log('❌ User with email admin@gmail.com not found');
      return;
    }
    
    console.log('📋 Found user:');
    console.log(`   ID: ${existingUser.id}`);
    console.log(`   Current Name: ${existingUser.name}`);
    console.log(`   Email: ${existingUser.email}`);
    console.log(`   Role: ${existingUser.role}`);
    
    // Update the user's name
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        name: newName,
        updatedAt: new Date()
      }
    });
    
    console.log('✅ User name updated successfully:');
    console.log(`   ID: ${updatedUser.id}`);
    console.log(`   New Name: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   Updated: ${updatedUser.updatedAt}`);
    
  } catch (error) {
    console.error('❌ Error updating user name:', error);
  }
}

async function listAllUsers() {
  try {
    console.log('📋 Listing all users in the database...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`\n📊 Total users: ${users.length}`);
    console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ ID                                   │ Name           │ Email                    │ Role  │');
    console.log('├─────────────────────────────────────────────────────────────────────────────┤');
    
    users.forEach(user => {
      const id = user.id.substring(0, 8) + '...';
      const name = user.name.padEnd(15).substring(0, 15);
      const email = user.email.padEnd(23).substring(0, 23);
      const role = user.role.padEnd(5);
      console.log(`│ ${id.padEnd(37)} │ ${name} │ ${email} │ ${role} │`);
    });
    
    console.log('└─────────────────────────────────────────────────────────────────────────────┘');
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
  }
}

async function main() {
  console.log('🚀 Starting user name update...\n');
  
  try {
    // Update the user name
    await updateUserName();
    console.log('\n' + '='.repeat(80) + '\n');
    
    // List users to show the change
    await listAllUsers();
    
  } catch (error) {
    console.error('❌ Error in main function:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ Database connection closed');
  }
}

// Run the script
main();
