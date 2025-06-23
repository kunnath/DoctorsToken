const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function debugPasswordCompare() {
  try {
    console.log('Debugging password comparison...');
    
    // Find admin user
    const admin = await User.findOne({ 
      where: { email: 'admin@doctorstoken.com' }
    });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found');
    console.log('User active:', admin.isActive);
    console.log('Password hash length:', admin.password.length);
    console.log('Password hash preview:', admin.password.substring(0, 20) + '...');
    
    // Test with different methods
    const testPassword = 'admin123456';
    
    // Method 1: Direct bcrypt.compare
    console.log('\n--- Method 1: Direct bcrypt.compare ---');
    const direct = await bcrypt.compare(testPassword, admin.password);
    console.log('Direct bcrypt.compare result:', direct);
    
    // Method 2: User instance method
    console.log('\n--- Method 2: User instance method ---');
    try {
      const instance = await admin.comparePassword(testPassword);
      console.log('User.comparePassword result:', instance);
    } catch (error) {
      console.log('User.comparePassword error:', error.message);
    }
    
    // Method 3: Test fresh hash
    console.log('\n--- Method 3: Test fresh hash ---');
    const freshHash = await bcrypt.hash(testPassword, 12);
    const freshTest = await bcrypt.compare(testPassword, freshHash);
    console.log('Fresh hash test result:', freshTest);
    
    // Method 4: Check if password is already hashed correctly
    console.log('\n--- Method 4: Password validation ---');
    console.log('Is password a valid bcrypt hash?', admin.password.startsWith('$2'));
    
    if (!direct) {
      console.log('\n--- Fixing password hash ---');
      const newHash = await bcrypt.hash(testPassword, 12);
      await admin.update({ password: newHash });
      
      const retest = await bcrypt.compare(testPassword, newHash);
      console.log('After update - direct comparison:', retest);
      
      const retestInstance = await admin.comparePassword(testPassword);
      console.log('After update - instance method:', retestInstance);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

debugPasswordCompare();
