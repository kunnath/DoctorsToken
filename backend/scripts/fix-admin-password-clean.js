// Load environment variables
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { User } = require('../models');

async function fixAdminPassword() {
  try {
    console.log('🔧 Fixing admin user password...');

    const email = 'admin@doctorstoken.com';
    const password = 'admin123456';

    // Find admin user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found:', user.email);

    // Hash the new password (using same rounds as User model)
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('🔑 New password hash created');

    // Update password directly to bypass Sequelize hooks
    await User.update(
      { password: hashedPassword },
      { where: { email }, hooks: false }
    );
    
    console.log('✅ Password updated in database');

    // Test the new password
    const updatedUser = await User.findOne({ where: { email } });
    const isMatch = await updatedUser.comparePassword(password);
    
    if (isMatch) {
      console.log('🎉 Password verification successful!');
      console.log('');
      console.log('📋 Admin login credentials:');
      console.log('   Email: admin@doctorstoken.com');
      console.log('   Password: admin123456');
    } else {
      console.log('❌ Password verification still failed');
    }

  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
  }
}

// Run the fix
fixAdminPassword();
