const { User } = require('../models');

const fixAdminUserProperly = async () => {
  try {
    console.log('Fixing admin user with proper password handling...');
    
    // Find admin user
    const adminUser = await User.findOne({ 
      where: { email: 'admin@doctorstoken.com' } 
    });
    
    if (!adminUser) {
      console.log('Admin user not found!');
      return;
    }
    
    console.log('Found admin user:', {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      isActive: adminUser.isActive
    });
    
    // Update the user properly to trigger hooks
    await adminUser.update({
      password: 'admin123456',  // This will trigger the beforeUpdate hook
      isActive: true
    });
    
    console.log('Admin user updated with proper password hashing!');
    
    // Test password comparison
    const isPasswordCorrect = await adminUser.comparePassword('admin123456');
    console.log('Password test result:', isPasswordCorrect);
    
    if (isPasswordCorrect) {
      console.log('✅ Password is working correctly!');
    } else {
      console.log('❌ Password comparison failed!');
    }
    
    // Verify the final state
    const updatedAdmin = await User.findOne({ 
      where: { email: 'admin@doctorstoken.com' } 
    });
    
    console.log('\nFinal admin user state:', {
      id: updatedAdmin.id,
      email: updatedAdmin.email,
      role: updatedAdmin.role,
      isActive: updatedAdmin.isActive,
      passwordHash: updatedAdmin.password.substring(0, 20) + '...'
    });
    
  } catch (error) {
    console.error('Error fixing admin user:', error);
  }
};

// Run the script
fixAdminUserProperly().then(() => {
  console.log('\nScript completed.');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
