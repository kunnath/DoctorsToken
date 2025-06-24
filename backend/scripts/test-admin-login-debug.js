// Load environment variables
require('dotenv').config();

const { User } = require('../models');

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin login functionality...');

    const email = 'admin@doctorstoken.com';
    const password = 'admin123456';

    // Find admin user
    console.log('📧 Looking for admin user with email:', email);
    const user = await User.findOne({ 
      where: { email, isActive: true }
    });

    if (!user) {
      console.log('❌ Admin user not found or inactive');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('   ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Active:', user.isActive);
    console.log('   Created:', user.createdAt);

    // Test password comparison
    console.log('\n🔑 Testing password comparison...');
    console.log('   Password to test:', password);
    console.log('   Stored password hash length:', user.password.length);

    const isMatch = await user.comparePassword(password);
    
    if (isMatch) {
      console.log('✅ Password matches! Admin login should work.');
    } else {
      console.log('❌ Password does not match!');
      console.log('   This might be the issue.');
      
      // Let's check if the password was hashed properly
      const bcrypt = require('bcryptjs');
      const isDirectMatch = await bcrypt.compare(password, user.password);
      console.log('   Direct bcrypt comparison:', isDirectMatch);
      
      // Test with the hash from our robust script
      console.log('\n🔧 Testing password hash manually...');
      const testHash = await bcrypt.hash(password, 10);
      console.log('   New hash would be:', testHash);
      const testMatch = await bcrypt.compare(password, testHash);
      console.log('   New hash comparison:', testMatch);
    }

  } catch (error) {
    console.error('❌ Error testing admin login:', error);
  }
}

testAdminLogin();
