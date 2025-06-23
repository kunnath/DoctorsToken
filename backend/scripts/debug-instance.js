const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function debugInstanceMethod() {
  try {
    console.log('Debugging instance method...');
    
    // Find admin user freshly
    const admin = await User.findOne({ 
      where: { email: 'admin@doctorstoken.com' }
    });
    
    console.log('Fresh instance password hash:', admin.password.substring(0, 20) + '...');
    
    const testPassword = 'admin123456';
    
    // Test instance method on fresh instance
    console.log('\n--- Fresh instance method test ---');
    const instanceResult = await admin.comparePassword(testPassword);
    console.log('Fresh instance comparePassword result:', instanceResult);
    
    // Test direct comparison on fresh instance
    console.log('\n--- Fresh direct comparison ---');
    const directResult = await bcrypt.compare(testPassword, admin.password);
    console.log('Fresh direct comparison result:', directResult);
    
    // Check if the method exists and is correct
    console.log('\n--- Method inspection ---');
    console.log('comparePassword method exists:', typeof admin.comparePassword === 'function');
    
    // Reload the instance
    await admin.reload();
    console.log('\n--- After reload ---');
    const reloadResult = await admin.comparePassword(testPassword);
    console.log('After reload comparePassword result:', reloadResult);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

debugInstanceMethod();
