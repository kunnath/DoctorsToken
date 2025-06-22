#!/bin/bash

# Doctors Token System Setup Script
echo "🏥 Setting up Doctors Token System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL."
    exit 1
fi

echo "✅ Node.js and PostgreSQL found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Setup environment file
echo "⚙️ Setting up environment configuration..."
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file from template. Please update it with your configuration."
else
    echo "📝 .env file already exists"
fi
cd ..

# Create database (optional - requires user input)
echo "🗄️ Database setup..."
echo "Please ensure your PostgreSQL database 'doctors_token_db' exists."
echo "You can create it by running: createdb doctors_token_db"
echo ""

# Instructions
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database credentials and SendGrid API key"
echo "2. Create the database: createdb doctors_token_db"
echo "3. Seed the database: cd backend && npm run seed"
echo "4. Start the development server: npm run dev"
echo ""
echo "Demo credentials will be available after seeding:"
echo "Patient: john.patient@email.com / password123"
echo "Doctor: dr.wilson@email.com / doctor123"
echo ""
echo "Visit http://localhost:3000 to access the application"
