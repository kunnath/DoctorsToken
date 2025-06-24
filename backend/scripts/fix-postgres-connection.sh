#!/bin/bash

echo "🔧 Fixing Postgres.app connection issues..."

# Check if Postgres.app is running
if ! pgrep -f "Postgres.app" > /dev/null; then
    echo "❌ Postgres.app is not running. Please start Postgres.app first."
    exit 1
fi

echo "✅ Postgres.app is running"

# Check if we can connect to postgres
echo "🔍 Testing database connection..."

# Try to connect with psql
if command -v psql &> /dev/null; then
    echo "📡 Testing connection to database..."
    
    # Try different connection methods
    echo "Trying connection with user 'postgres'..."
    if psql -h localhost -p 5432 -U postgres -d postgres -c "SELECT 1;" 2>/dev/null; then
        echo "✅ Connection successful with postgres user"
    else
        echo "❌ Connection failed with postgres user"
        
        # Try with current user
        current_user=$(whoami)
        echo "Trying connection with user '$current_user'..."
        if psql -h localhost -p 5432 -U $current_user -d postgres -c "SELECT 1;" 2>/dev/null; then
            echo "✅ Connection successful with user $current_user"
            echo "📝 Consider updating .env file to use user: $current_user"
        else
            echo "❌ Connection failed with user $current_user"
        fi
    fi
else
    echo "❌ psql command not found. Please ensure PostgreSQL tools are installed."
fi

echo ""
echo "🛠️  Manual fixes to try:"
echo "1. Open Postgres.app"
echo "2. Go to Preferences/Settings"
echo "3. Check 'Authentication' or 'Permissions' tab"
echo "4. Ensure 'trust' authentication is enabled for local connections"
echo "5. Restart Postgres.app"
echo ""
echo "Alternative solutions:"
echo "- Use 'md5' authentication instead of 'trust'"
echo "- Create a specific database user"
echo "- Use socket connection instead of TCP"
