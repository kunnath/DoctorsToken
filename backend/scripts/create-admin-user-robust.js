const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

const createAdminUserRobust = async () => {
  console.log('🚀 Creating admin user with robust database connection...');
  
  // Try multiple database configurations
  const dbConfigs = [
    {
      name: 'Current .env config',
      config: {
        database: process.env.DB_NAME || 'doctors_token_db',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        logging: false
      }
    },
    {
      name: 'Custom port with current user',
      config: {
        database: process.env.DB_NAME || 'doctors_token_db',
        username: process.env.USER,
        password: '',
        host: 'localhost',
        port: 5433,
        dialect: 'postgres',
        logging: false
      }
    },
    {
      name: 'Socket connection with current user',
      config: {
        database: process.env.DB_NAME || 'doctors_token_db',
        username: process.env.USER,
        password: '',
        host: '/tmp',
        port: 5432,
        dialect: 'postgres',
        logging: false
      }
    },
    {
      name: 'Localhost with current user',
      config: {
        database: process.env.DB_NAME || 'doctors_token_db',
        username: process.env.USER,
        password: '',
        host: 'localhost',
        port: 5432,
        dialect: 'postgres',
        logging: false
      }
    },
    {
      name: 'Localhost with postgres user',
      config: {
        database: process.env.DB_NAME || 'doctors_token_db',
        username: 'postgres',
        password: '',
        host: 'localhost',
        port: 5432,
        dialect: 'postgres',
        logging: false
      }
    }
  ];

  let sequelize = null;
  let workingConfig = null;

  // Try each configuration
  for (const { name, config } of dbConfigs) {
    try {
      console.log(`🔧 Trying: ${name}`);
      sequelize = new Sequelize(config);
      await sequelize.authenticate();
      console.log(`✅ Connected successfully with: ${name}`);
      workingConfig = { name, config };
      break;
    } catch (error) {
      console.log(`❌ Failed with ${name}: ${error.message}`);
      if (sequelize) {
        await sequelize.close();
        sequelize = null;
      }
    }
  }

  if (!sequelize) {
    console.error('❌ Could not establish database connection with any configuration.');
    console.log('');
    console.log('🛠️  Please try the following:');
    console.log('1. Ensure Postgres.app is running');
    console.log('2. Run: node scripts/setup-database.js');
    console.log('3. Check Postgres.app authentication settings');
    process.exit(1);
  }

  try {
    // Define User model
    const User = sequelize.define('User', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('user', 'doctor', 'admin'),
        defaultValue: 'user'
      },
      phone: {
        type: Sequelize.STRING
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    }, {
      tableName: 'users',
      timestamps: true
    });

    // Sync the model (create table if it doesn't exist)
    await User.sync();

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      await sequelize.close();
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
    
    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password: admin123456 (Please change this immediately)');
    console.log('👑 Role:', adminUser.role);
    console.log('');
    console.log('💾 Database configuration used:');
    console.log(`   Name: ${workingConfig.name}`);
    console.log(`   Host: ${workingConfig.config.host}`);
    console.log(`   User: ${workingConfig.config.username}`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
};

// Load environment variables
require('dotenv').config();

// Run the script
createAdminUserRobust();

module.exports = createAdminUserRobust;
