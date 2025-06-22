const { User } = require('../models');

const checkAdminUser = async () => {
  try {
    console.log('Checking for admin users...');
    
    const adminUsers = await User.findAll({ 
      where: { role: 'admin' },
      attributes: ['id', 'name', 'email', 'role', 'isActive', 'createdAt']
    });
    
    console.log('Found admin users:', JSON.stringify(adminUsers, null, 2));
    
    if (adminUsers.length === 0) {
      console.log('No admin users found in database');
    } else {
      console.log(`Found ${adminUsers.length} admin user(s)`);
    }
    
  } catch (error) {
    console.error('Error checking admin users:', error);
  }
};

// Run the check
checkAdminUser();

module.exports = checkAdminUser;
