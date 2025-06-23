const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function fixAdminPassword() {
  try {
    console.log('Fixing admin password definitively...');
    
    const admin = await User.findOne({ 
      where: { email: 'admin@doctorstoken.com' }
    });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('Admin found, current password hash:', admin.password.substring(0, 30) + '...');
    
    const newPassword = 'admin123456';
    console.log('Setting new password:', newPassword);
    
    // Hash the password manually
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    console.log('New hash:', hashedPassword.substring(0, 30) + '...');
    
    // Update using raw SQL to bypass hooks
    await admin.update({ password: hashedPassword }, { 
      hooks: false,
      validate: false 
    });
    
    console.log('✅ Password updated');
    
    // Get fresh instance
    const freshAdmin = await User.findOne({ 
      where: { email: 'admin@doctorstoken.com' }
    });
    
    console.log('Fresh instance password hash:', freshAdmin.password.substring(0, 30) + '...');
    
    // Test both methods
    const directTest = await bcrypt.compare(newPassword, freshAdmin.password);
    console.log('Direct bcrypt test:', directTest ? '✅ PASS' : '❌ FAIL');
    
    const instanceTest = await freshAdmin.comparePassword(newPassword);
    console.log('Instance method test:', instanceTest ? '✅ PASS' : '❌ FAIL');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

fixAdminPassword();
