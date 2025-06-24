const { Sequelize } = require('sequelize');

// Alternative configuration for Postgres.app on macOS
const createSequelizeConnection = () => {
  const dbConfig = {
    database: process.env.DB_NAME || 'doctors_token_db',
    username: process.env.DB_USER || process.env.USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    options: {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  };

  // Try socket connection first (works better with Postgres.app)
  if (process.platform === 'darwin' && !process.env.DB_HOST) {
    dbConfig.options.host = '/tmp'; // Unix socket path for Postgres.app
    dbConfig.options.port = 5432;
  } else {
    // Use TCP connection
    dbConfig.options.host = process.env.DB_HOST || 'localhost';
    dbConfig.options.port = process.env.DB_PORT || 5432;
  }

  return new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig.options
  );
};

const sequelize = createSequelizeConnection();

// Test connection with fallback options
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.log('❌ Unable to connect to the database with current config.');
    
    // Try alternative configurations
    const alternatives = [
      { host: 'localhost', port: 5432, username: process.env.USER },
      { host: '/tmp', port: 5432, username: process.env.USER },
      { host: 'localhost', port: 5432, username: 'postgres' },
      { host: '127.0.0.1', port: 5432, username: process.env.USER }
    ];

    for (const alt of alternatives) {
      try {
        const altSequelize = new Sequelize(
          process.env.DB_NAME || 'doctors_token_db',
          alt.username,
          process.env.DB_PASSWORD || '',
          {
            host: alt.host,
            port: alt.port,
            dialect: 'postgres',
            logging: false,
            pool: { max: 1, min: 0, acquire: 3000, idle: 1000 }
          }
        );
        
        await altSequelize.authenticate();
        console.log(`✅ Alternative connection successful with: ${JSON.stringify(alt)}`);
        await altSequelize.close();
        return alt;
      } catch (altError) {
        // Continue to next alternative
      }
    }
    
    throw error;
  }
};

module.exports = { sequelize, testConnection };
