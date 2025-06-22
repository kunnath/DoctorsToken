const { User } = require('../models');
const bcrypt = require('bcryptjs');

const fixAdminUser = async () => {
  try {
    console.log('Fixing admin user...');
    
    // Find admin user
    const adminUser = await User.findOne({ 
      where: { email: 'admin@doctorstoken.com' } 
    });
    
    if (!adminUser) {
      console.log('Admin user not found. Creating new admin user...');
      
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123456', 10);
      const newAdmin = await User.create({
        name: 'System Administrator',
        email: 'admin@doctorstoken.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+1234567890',
        isActive: true
      });
      
      console.log('New admin user created:', {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role,
        isActive: newAdmin.isActive
      });
    } else {
      console.log('Found existing admin user:', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive
      });
      
      // Update admin user to be active and ensure password is correct
      const hashedPassword = await bcrypt.hash('admin123456', 10);
      await adminUser.update({
        password: hashedPassword,
        isActive: true
      });
      
      console.log('Admin user updated successfully!');
      console.log('New status:', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        isActive: true,
        passwordUpdated: true
      });
    }
    
    console.log('\nAdmin user is now ready for login!');
    console.log('Login credentials:');
    console.log('Email: admin@doctorstoken.com');
    console.log('Password: admin123456');
    
  } catch (error) {
    console.error('Error fixing admin user:', error);
  }
};

// Run the script
fixAdminUser().then(() => {
  console.log('\nScript completed.');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
