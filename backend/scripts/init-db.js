const { sequelize } = require('../config/database');
const { seedData } = require('../seeds/seed');

async function initializeDatabase() {
  try {
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    console.log('🗄️ Creating database tables...');
    await sequelize.sync({ force: true }); // This will drop and recreate tables
    console.log('✅ Database tables created');

    console.log('🌱 Seeding database with sample data...');
    await seedData();
    console.log('✅ Database seeded successfully');

    console.log('🎉 Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
