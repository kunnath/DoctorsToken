#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function setupDatabase() {
  console.log('🚀 Setting up database for DoctorsToken...');
  
  // Check if Postgres.app is running
  try {
    await execAsync('pgrep -f "Postgres.app"');
    console.log('✅ Postgres.app is running');
  } catch (error) {
    console.log('❌ Postgres.app is not running. Please start Postgres.app first.');
    process.exit(1);
  }

  // Get current user
  const currentUser = process.env.USER;
  console.log(`👤 Current user: ${currentUser}`);

  // Try to create database with different methods
  const connectionMethods = [
    { user: currentUser, host: 'localhost' },
    { user: 'postgres', host: 'localhost' },
    { user: currentUser, host: '/tmp' }, // Unix socket
    { user: 'postgres', host: '/tmp' }   // Unix socket
  ];

  let successful = false;
  let workingConfig = null;

  for (const method of connectionMethods) {
    try {
      console.log(`🔧 Trying connection with user: ${method.user}, host: ${method.host}`);
      
      // Try to connect and create database
      const createDbCommand = method.host === '/tmp' 
        ? `psql -h ${method.host} -U ${method.user} -c "CREATE DATABASE doctors_token_db;" postgres`
        : `psql -h ${method.host} -p 5432 -U ${method.user} -c "CREATE DATABASE doctors_token_db;" postgres`;
      
      await execAsync(createDbCommand);
      console.log('✅ Database created successfully');
      workingConfig = method;
      successful = true;
      break;
    } catch (error) {
      if (error.stderr && error.stderr.includes('already exists')) {
        console.log('✅ Database already exists');
        workingConfig = method;
        successful = true;
        break;
      }
      console.log(`❌ Failed with ${method.user}@${method.host}: ${error.message}`);
    }
  }

  if (!successful) {
    console.log('❌ Could not establish database connection with any method.');
    console.log('');
    console.log('🛠️  Manual steps to fix:');
    console.log('1. Open Postgres.app');
    console.log('2. Click on "Open psql" or use the terminal');
    console.log('3. Run: CREATE DATABASE doctors_token_db;');
    console.log('4. Check Postgres.app preferences for authentication settings');
    process.exit(1);
  }

  // Update .env file with working configuration
  if (workingConfig) {
    console.log('📝 Updating .env file with working configuration...');
    
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env');
    
    try {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Update DB_USER
      envContent = envContent.replace(/^DB_USER=.*$/m, `DB_USER=${workingConfig.user}`);
      
      // Update DB_HOST if using socket
      if (workingConfig.host === '/tmp') {
        if (envContent.includes('DB_HOST=')) {
          envContent = envContent.replace(/^DB_HOST=.*$/m, `DB_HOST=/tmp`);
        } else {
          envContent += '\nDB_HOST=/tmp';
        }
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env file updated successfully');
    } catch (error) {
      console.log('⚠️  Could not update .env file:', error.message);
    }
  }

  console.log('🎉 Database setup completed successfully!');
  console.log('');
  console.log('📋 Working configuration:');
  console.log(`   User: ${workingConfig.user}`);
  console.log(`   Host: ${workingConfig.host}`);
  console.log('');
  console.log('🚀 You can now run: node scripts/create-admin-user.js');
}

// Run the setup
setupDatabase().catch(error => {
  console.error('❌ Database setup failed:', error.message);
  process.exit(1);
});
