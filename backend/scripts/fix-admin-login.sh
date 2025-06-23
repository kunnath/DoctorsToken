#!/bin/bash

echo "🔧 Fixing Admin Login Issue..."
echo "==============================="

cd "$(dirname "$0")"

echo "1. Checking admin user status..."
node scripts/check-admin-user.js

echo ""
echo "2. Fixing admin password..."
node scripts/fix-admin-password.js

echo ""
echo "3. Testing admin login..."
node scripts/test-api-login-debug.js

echo ""
echo "✅ Admin login fix completed!"
echo ""
echo "Admin credentials:"
echo "Email: admin@doctorstoken.com"
echo "Password: admin123456"
echo ""
echo "You can now login at: http://localhost:3000"
