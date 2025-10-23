import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creating new admin user...');
    
    const email = 'hamza@gmail.com';
    const password = '12345678';
    const name = 'Hamza Admin';
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('❌ User with email hamza@gmail.com already exists');
      return;
    }
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: UserRole.ADMIN
      }
    });
    
    console.log('✅ Admin user created successfully:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.createdAt}`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

async function updateExistingUserPassword() {
  try {
    console.log('🔐 Updating existing user password...');
    
    const email = 'admin@inventory.com';
    const newPassword = '1234admin';
    
    // Find the existing user
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!existingUser) {
      console.log('❌ User with email admin@inventory.com not found');
      return;
    }
    
    console.log('📋 Found existing user:');
    console.log(`   ID: ${existingUser.id}`);
    console.log(`   Name: ${existingUser.name}`);
    console.log(`   Email: ${existingUser.email}`);
    console.log(`   Role: ${existingUser.role}`);
    
    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        updatedAt: new Date()
      }
    });
    
    console.log('✅ User password updated successfully:');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Updated: ${updatedUser.updatedAt}`);
    
  } catch (error) {
    console.error('❌ Error updating user password:', error);
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
  console.log('🚀 Starting user management operations...\n');
  
  try {
    // List current users
    await listAllUsers();
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Create new admin user
    await createAdminUser();
    console.log('\n' + '='.repeat(80) + '\n');
    
    // List users again to show changes
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
