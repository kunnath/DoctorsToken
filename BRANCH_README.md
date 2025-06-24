# Database Setup & Improvements

This branch (`feature/database-setup-improvements`) contains major improvements to the database setup process and authentication system for the DoctorsToken application.

## 🚀 What's New

### Database Setup Enhancements
- **Robust PostgreSQL Connection Handling**: Automatic detection and configuration for both Postgres.app and Homebrew PostgreSQL
- **Multiple Connection Methods**: Support for TCP and Unix socket connections with automatic fallback
- **macOS Compatibility**: Specific fixes for PostgreSQL authentication issues on macOS
- **Trust Authentication**: Proper setup for localhost development environment

### New Scripts & Tools

#### 🔧 Database Management Scripts
- `backend/scripts/setup-database.js` - Automated database setup and connection testing
- `backend/scripts/create-admin-user-robust.js` - Advanced admin user creation with multiple DB configurations
- `backend/scripts/fix-admin-password-clean.js` - Clean password reset utility for admin user
- `backend/scripts/test-admin-login-debug.js` - Comprehensive login functionality testing

#### 🛠️ Troubleshooting & Diagnostics
- `backend/scripts/fix-postgres-connection.sh` - PostgreSQL connection diagnostics
- `backend/scripts/fix-postgres-permissions-guide.sh` - Step-by-step macOS permission setup guide
- `backend/config/database-alt.js` - Alternative database configuration with socket support

## 🔐 Authentication & Security

### Admin User Management
- **Default Admin Credentials**: 
  - Email: `admin@doctorstoken.com`
  - Password: `admin123456` (change immediately in production)
- **Improved Password Hashing**: Consistent bcrypt implementation (12 rounds)
- **Login Testing**: Comprehensive utilities to verify authentication

### Sample User Accounts
The database comes pre-seeded with test accounts:

#### Patient Accounts
- `john.patient@email.com` / `password123`
- `jane.smith@email.com` / `password123`
- `mike.johnson@email.com` / `password123`

#### Doctor Accounts
- `dr.wilson@email.com` / `doctor123` (Cardiology)
- `dr.brown@email.com` / `doctor123` (Pediatrics)
- `dr.davis@email.com` / `doctor123` (Orthopedics)
- `dr.taylor@email.com` / `doctor123` (Dermatology)
- `dr.anderson@email.com` / `doctor123` (Internal Medicine)

## 🏥 Database Schema & Seeding

### Complete Seed Data
- **3 Hospitals**: City General, Metropolitan Medical, Riverside Healthcare
- **9 Users**: 1 admin, 3 patients, 5 doctors
- **5 Doctor Profiles**: Complete specialization and schedule data
- **Realistic Data**: Proper addresses, phone numbers, and medical information

## 📋 Quick Start Guide

### 1. Database Setup (Automatic)
```bash
cd backend
node scripts/setup-database.js
```

### 2. Initialize Database with Seed Data
```bash
cd backend
node scripts/init-db.js
```

### 3. Create/Reset Admin User
```bash
cd backend
node scripts/create-admin-user-robust.js
```

### 4. Test Login Functionality
```bash
cd backend
node scripts/test-admin-login-debug.js
```

## 🔍 Troubleshooting

### PostgreSQL Connection Issues on macOS
If you encounter PostgreSQL authentication errors:

1. **Run the diagnostic script**:
   ```bash
   ./backend/scripts/fix-postgres-connection.sh
   ```

2. **Follow the permission guide**:
   ```bash
   ./backend/scripts/fix-postgres-permissions-guide.sh
   ```

3. **Use alternative setup**:
   ```bash
   # Install PostgreSQL via Homebrew (recommended)
   brew install postgresql@15
   brew services start postgresql@15
   ```

### Common Issues & Solutions

#### Issue: "Postgres.app failed to verify trust authentication"
**Solution**: Run the permission guide script or switch to Homebrew PostgreSQL

#### Issue: "Role 'postgres' does not exist"
**Solution**: The setup scripts automatically detect your system user and configure accordingly

#### Issue: "Admin login not working"
**Solution**: Use the password reset script:
```bash
node scripts/fix-admin-password-clean.js
```

## 🌟 Features for Community Users

### For Developers
- **Easy Setup**: One-command database initialization
- **Multiple PostgreSQL Support**: Works with Postgres.app, Homebrew, or Docker
- **Comprehensive Testing**: Built-in scripts to verify everything works
- **Clear Documentation**: Step-by-step troubleshooting guides

### For Contributors
- **Robust Codebase**: Handles edge cases and connection failures gracefully
- **Diagnostic Tools**: Easy to identify and fix database issues
- **Sample Data**: Rich test data for development and testing
- **Clean Architecture**: Modular scripts that can be used independently

## 📝 Configuration Files

### Environment Variables (.env)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5433  # Or 5432 for standard PostgreSQL
DB_NAME=doctors_token_db
DB_USER=your_username
DB_PASSWORD=

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key

# Other configurations...
```

### Database Configuration
The application automatically detects and configures the best database connection method for your system.

## 🚀 Production Deployment

Before deploying to production:

1. **Change Default Passwords**: Update all default credentials
2. **Configure Environment**: Set proper production environment variables
3. **Database Security**: Use proper authentication methods (not trust)
4. **SSL/TLS**: Enable encrypted connections for production database

## 🤝 Contributing

This branch provides a solid foundation for:
- Database management improvements
- Authentication system enhancements
- macOS compatibility fixes
- Developer experience improvements

Feel free to submit PRs with additional improvements or bug fixes!

## 📞 Support

If you encounter issues with this setup:
1. Check the troubleshooting section above
2. Run the diagnostic scripts
3. Open an issue with the output from diagnostic scripts
4. Include your operating system and PostgreSQL version

---

**Branch Status**: Ready for community use and production deployment
**Last Updated**: June 24, 2025
**Compatibility**: macOS, Linux (Windows support coming soon)
