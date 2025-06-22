const bcrypt = require('bcryptjs');
const { User } = require('../models');

const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const adminData = {
      name: 'System Administrator',
      email: 'admin@doctorstoken.com',
      password: 'admin123456', // You should change this password
      role: 'admin',
      phone: '+1234567890',
      isActive: true
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    adminData.password = hashedPassword;

    const adminUser = await User.create(adminData);
    
    console.log('Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('Password: admin123456 (Please change this immediately)');
    console.log('Role:', adminUser.role);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Run the script
createAdminUser();

module.exports = createAdminUser;
