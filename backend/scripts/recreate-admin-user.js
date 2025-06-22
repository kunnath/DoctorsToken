const { User } = require('../models');

const recreateAdminUser = async () => {
  try {
    console.log('Checking for existing admin user...');
    
    // Find and delete existing admin user
    const existingAdmin = await User.findOne({ where: { email: 'admin@doctorstoken.com' } });
    
    if (existingAdmin) {
      console.log('Deleting existing admin user...');
      await existingAdmin.destroy();
      console.log('Existing admin user deleted.');
    }

    console.log('Creating new admin user...');
    
    // Create admin user using the model (this will trigger password hashing hooks)
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@doctorstoken.com',
      password: 'admin123456', // This will be hashed by the model hooks
      role: 'admin',
      phone: '+1234567890',
      isActive: true
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('Password: admin123456');
    console.log('Role:', adminUser.role);
    console.log('ID:', adminUser.id);
    
    // Test the password comparison
    const isPasswordValid = await adminUser.comparePassword('admin123456');
    console.log('Password validation test:', isPasswordValid ? '✅ PASS' : '❌ FAIL');
    
    if (!isPasswordValid) {
      console.error('❌ Password validation failed! There might be an issue with the comparePassword method.');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error recreating admin user:', error);
    process.exit(1);
  }
};

// Run the script
recreateAdminUser();
