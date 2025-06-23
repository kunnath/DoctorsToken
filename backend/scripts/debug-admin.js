const { User } = require('../models');
const { sequelize } = require('../config/database');

async function debugAdmin() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Check all users
    const allUsers = await User.findAll();
    console.log('Total users in database:', allUsers.length);

    // Check admin users specifically
    const adminUsers = await User.findAll({ 
      where: { role: 'admin' },
      raw: true 
    });
    console.log('Admin users found:', adminUsers.length);
    
    if (adminUsers.length > 0) {
      adminUsers.forEach(admin => {
        console.log('Admin user:', {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive,
          hasPassword: admin.password ? 'Yes' : 'No',
          createdAt: admin.createdAt
        });
      });
    }

    // Try to find user by email
    const adminByEmail = await User.findOne({ 
      where: { email: 'admin@doctorstoken.com' },
      raw: true 
    });
    console.log('Admin by email:', adminByEmail ? 'Found' : 'Not found');
    if (adminByEmail) {
      console.log('Admin details:', {
        id: adminByEmail.id,
        email: adminByEmail.email,
        role: adminByEmail.role,
        isActive: adminByEmail.isActive
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

debugAdmin();
