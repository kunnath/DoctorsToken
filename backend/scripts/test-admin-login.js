const bcrypt = require('bcryptjs');
const { User } = require('../models');

const testAdminLogin = async () => {
  try {
    console.log('Testing admin login...');
    
    // Find admin user
    const adminUser = await User.findOne({ 
      where: { 
        email: 'admin@doctorstoken.com',
        role: 'admin'
      }
    });
    
    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Admin user found:', {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      isActive: adminUser.isActive
    });
    
    // Test password
    const testPassword = 'admin123456';
    console.log('Testing password:', testPassword);
    
    const isValidPassword = await bcrypt.compare(testPassword, adminUser.password);
    console.log('Password comparison result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Password mismatch - recreating admin user with correct password...');
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      // Update admin user password
      await adminUser.update({ password: hashedPassword });
      
      console.log('Admin password updated successfully');
      
      // Test again
      const retest = await bcrypt.compare(testPassword, hashedPassword);
      console.log('Password retest result:', retest);
    } else {
      console.log('Password is correct - login should work');
    }
    
  } catch (error) {
    console.error('Error testing admin login:', error);
  }
};

// Run the test
testAdminLogin();

module.exports = testAdminLogin;
