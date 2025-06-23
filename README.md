# 🏥 Doctors Token System

A comprehensive full-stack appointment booking system with GPS verification for healthcare providers and patients. This modern healthcare management platform streamlines the appointment booking process with real-time location verification and automated workflows.

## � Demo Videos

### 📱 Patient Appointment Flow Demo
[![Patient Appointment Flow](https://img.youtube.com/vi/MDAuNJzBTyk/0.jpg)](https://youtube.com/shorts/MDAuNJzBTyk)

**Watch:** [Patient Appointment Booking Demo](https://youtube.com/shorts/MDAuNJzBTyk)

### 👨‍⚕️ Doctor Appointment Management Demo  
[![Doctor Appointment Flow](https://img.youtube.com/vi/F8DlVABYvBI/0.jpg)](https://youtu.be/F8DlVABYvBI)

**Watch:** [Doctor Dashboard & Appointment Management](https://youtu.be/F8DlVABYvBI)

## 🎯 Core Features

### 🩺 Patient Experience
- **Seamless Registration** - Quick account creation with role selection
- **Smart Doctor Search** - Find doctors by name, specialization, or hospital
- **Real-time Booking** - Schedule appointments with instant availability check
- **GPS Location Verification** - Automated location verification on appointment day
- **Appointment Management** - Track status, view history, cancel appointments
- **Email Notifications** - Receive updates for all appointment status changes
- **Token-based System** - Unique appointment tokens for easy reference

### 👨‍⚕️ Doctor Dashboard
- **Professional Profile Management** - Complete profile with specialization and availability
- **Appointment Review System** - Approve/reject patient requests with custom notes
- **Patient Information Access** - View patient details and medical history
- **Schedule Overview** - Dashboard with pending, approved, and completed appointments
- **Real-time Notifications** - Instant alerts for new appointment requests
- **GPS Monitoring** - Track patient location verification status

### 🔑 Admin Control Panel
- **Comprehensive Dashboard** - System-wide analytics and key performance metrics
- **User Management** - View, activate/deactivate, and manage all users (patients, doctors, admins)
- **Advanced Analytics** - User registration trends, appointment patterns, and peak hour analysis
- **Doctor Performance Tracking** - Monitor top-performing doctors and appointment completion rates
- **Hospital Utilization Reports** - Track usage across different hospital locations
- **Real-time System Monitoring** - Live stats for total users, appointments, and growth metrics
- **Data Export Capabilities** - Export analytics data in CSV and JSON formats
- **User Detail Views** - Deep-dive into individual user profiles and appointment histories
- **Responsive Design** - Mobile-optimized admin interface with detailed insights
- **Security Features** - Role-based access control with JWT authentication

### 🏥 Advanced System Features
- **Intelligent GPS Validation** - Automatic cancellation if patient >500m from hospital
- **Background Processing** - Node-cron powered automated appointment monitoring
- **Email Integration** - SendGrid powered professional email notifications with reminders
- **Automated Reminder System** - Email reminders sent 1 hour and 15 minutes before appointments
- **One-click Cancellation** - Email-based appointment cancellation with automatic notifications
- **Multi-role Authentication** - Secure JWT-based auth for patients, doctors, and admins
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Real-time Updates** - Live status updates across all user interfaces
- **Admin Analytics** - Comprehensive business intelligence and reporting dashboard

## 🛠 Technology Stack

### Backend Architecture
- **Node.js & Express.js** - High-performance RESTful API server
- **PostgreSQL + Sequelize** - Robust relational database with ORM
- **JWT Authentication** - Stateless, secure token-based authentication
- **SendGrid Integration** - Professional email notification service
- **Node-cron** - Reliable background job scheduling
- **Geolib** - Precise GPS distance calculations using Haversine formula
- **Joi Validation** - Comprehensive input validation and sanitization

### Frontend Framework
- **React 18** - Modern, component-based user interface
- **React Router v6** - Declarative client-side routing
- **Tailwind CSS** - Utility-first, responsive styling framework
- **React Hook Form** - Performant form handling with validation
- **React Hot Toast** - Beautiful, accessible user notifications
- **Date-fns** - Lightweight date manipulation and formatting
- **Lucide React** - Consistent, beautiful SVG icon library

### Development & DevOps
- **Concurrently** - Streamlined development with parallel processes
- **Nodemon** - Auto-restart development server for faster iteration
- **PostCSS & Autoprefixer** - Advanced CSS processing and browser compatibility
- **CORS & Helmet** - Comprehensive security middleware
- **Rate Limiting** - API protection against abuse

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v16 or higher
- **PostgreSQL** v12 or higher  
- **SendGrid Account** (for email notifications)
- **Git** for version control

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/your-username/DoctorsToken.git
cd DoctorsToken

# Install all dependencies (frontend + backend)
npm run install-deps
```

### 2. Database Setup

```sql
-- Create PostgreSQL database
CREATE DATABASE doctors_token_db;
CREATE USER doctors_token_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE doctors_token_db TO doctors_token_user;
```

### 3. Environment Configuration

```bash
# Backend environment setup
cd backend
cp .env.example .env
```

**Update `backend/.env` with your configuration:**

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=doctors_token_db
DB_USER=doctors_token_user
DB_PASSWORD=your_secure_password

# JWT Secret (generate a strong, unique secret)
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com

# Server Configuration
PORT=5000
NODE_ENV=development

# GPS Configuration
MAX_DISTANCE_METERS=500
```

**Frontend environment setup:**

```bash
# Frontend environment setup
cd ../frontend
echo "REACT_APP_API_BASE_URL=http://localhost:5000/api" > .env
```

### 4. Initialize Database

```bash
# From backend directory
cd backend

# Run database migrations and seed data
npm run seed

# Setup admin user (creates admin account if not exists)
node scripts/create-admin-user.js

# Verify admin setup
node scripts/check-admin-user.js
```

### 5. Start Development Environment

```bash
# From project root directory
npm run dev
```

**This starts:**
- 🔹 Backend API server: http://localhost:5000
- 🔹 Frontend React app: http://localhost:3000

## 🔑 Demo Accounts

### 👥 Patient Test Accounts
```
Email: john.patient@email.com
Password: password123
Role: Patient

Email: jane.smith@email.com  
Password: password123
Role: Patient
```

### 👨‍⚕️ Doctor Test Accounts
```
Email: dr.wilson@email.com
Password: doctor123
Role: Doctor
Specialization: Cardiology

Email: dr.brown@email.com
Password: doctor123  
Role: Doctor
Specialization: Pediatrics
```

### 🔐 Admin Access
```
Email: admin@doctorstoken.com
Password: admin123456
Role: System Administrator

Admin Panel: http://localhost:3000/admin/dashboard
Direct Login: Use the credentials above on the main login page
```

**⚠️ IMPORTANT:** Change admin credentials in production! Run the admin setup scripts to create secure credentials.

## � Complete User Workflows

### 🩺 Patient Appointment Journey

#### 1. Registration & Login
1. Visit **http://localhost:3000/register**
2. Select **"Patient"** role
3. Fill registration form with personal details
4. Automatic login after successful registration
5. Welcome dashboard with appointment options

#### 2. Doctor Discovery
1. Navigate to **"Book Appointment"**
2. **Search Options:**
   - 🔍 Search by doctor name
   - 🏥 Search by hospital name
   - 🩺 Filter by specialization
3. **Browse Results:** View doctor profiles with:
   - Professional information and experience
   - Hospital affiliation and location
   - Available time slots and consultation fees
   - Patient reviews and ratings

#### 3. Appointment Booking Process
1. **Select Doctor:** Choose from search results
2. **Choose Date:** Pick from available dates (no Sundays)
3. **Select Time:** Choose from doctor's available hours
4. **Provide Details:**
   - Reason for visit (minimum 10 characters)
   - Additional notes (optional)
   - Contact preferences
5. **Confirm Booking:** Review and submit appointment request
6. **Receive Confirmation:** Get unique appointment token

#### 4. Appointment Management
1. **Track Status:** Monitor appointment approval in real-time
2. **Receive Notifications:** Email updates for status changes
3. **GPS Verification:** On appointment day:
   - Click "Verify Location" button
   - Allow browser location access
   - System confirms you're within 500m of hospital
   - Automatic cancellation if too far away
4. **Post-Appointment:** Rate doctor and provide feedback

### 👨‍⚕️ Doctor Management Workflow

#### 1. Professional Setup
1. **Register** with "Doctor" role
2. **Complete Profile:**
   - Medical license number
   - Specialization and experience
   - Hospital affiliation
   - Available hours and days
   - Consultation fees
   - Professional bio and qualifications

#### 2. Dashboard Overview
1. **Quick Stats Display:**
   - 📊 Pending appointments requiring action
   - ✅ Approved appointments for today
   - 📈 Total patient volume
   - 📅 Upcoming schedule overview

#### 3. Appointment Review Process
1. **Review Requests:** New appointment notifications
2. **Patient Information:** Access to:
   - Patient contact details
   - Medical history (if available)
   - Reason for visit
   - Previous appointment records
3. **Decision Making:**
   - ✅ **Approve:** Confirm appointment with optional notes
   - ❌ **Reject:** Decline with mandatory reason
   - 📝 **Request Info:** Ask for additional details

#### 4. Schedule Management
1. **Calendar View:** Visual schedule with all appointments
2. **Patient Communication:** Direct contact through platform
3. **GPS Monitoring:** Track patient arrival verification
4. **Appointment History:** Complete record of all interactions

### 🔐 Admin Management Workflow

#### 1. System Overview Dashboard
1. **Access:** Login with admin credentials → Auto-redirect to admin dashboard
2. **Quick Metrics:**
   - 📊 Total platform users (patients, doctors, admins)
   - � Hospital network statistics
   - 📅 Recent appointment activity
   - 📈 Growth trends and key performance indicators

#### 2. User Management
1. **User Overview:**
   - Complete list of all registered users
   - Filter by role (patient, doctor, admin)
   - Search by name, email, or registration date
   - User activation/deactivation controls
2. **User Details:**
   - View complete profile information
   - Appointment history and statistics
   - Account status and activity logs
   - Direct user management actions

#### 3. Advanced Analytics
1. **Registration Trends:**
   - User growth patterns by role and time period
   - Visual charts showing registration distribution
   - Recent activity indicators with growth analysis
   - Export capabilities for business intelligence
2. **Appointment Analytics:**
   - Status breakdown (pending, approved, completed, cancelled)
   - Time-based trends and patterns
   - Success rate calculations and insights
   - Peak hours analysis for resource planning
3. **Performance Metrics:**
   - Top-performing doctors by appointment volume
   - Hospital utilization rates and coverage
   - System efficiency indicators
   - Mobile-responsive charts and data visualization

#### 4. System Monitoring
1. **Real-time Health Metrics:**
   - Platform efficiency monitoring
   - User engagement statistics
   - Network coverage analysis
   - Live data with auto-refresh capabilities
2. **Data Export & Reporting:**
   - CSV export for comprehensive analytics
   - JSON export for technical integration
   - Print-friendly report generation
   - Period-based data filtering (24h, 7d, 30d, 90d)

## �🌐 API Documentation

### 🔐 Admin API Endpoints
```http
GET /api/admin/dashboard
Authorization: Bearer <admin_jwt_token>
```

```http
GET /api/admin/users?page=1&limit=10&role=all&search=query
Authorization: Bearer <admin_jwt_token>
```

```http
GET /api/admin/analytics?period=7d
Authorization: Bearer <admin_jwt_token>
```

```http
PUT /api/admin/users/:userId/status
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "isActive": true
}
```

### 🔐 Authentication Endpoints
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "securepassword",
  "role": "patient|doctor",
  "phone": "+1-555-0123"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### 📅 Appointment Management
```http
POST /api/appointments
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "doctorId": "uuid",
  "hospitalId": "uuid",
  "appointmentDate": "2025-06-25",
  "appointmentTime": "14:30",
  "reason": "Regular checkup and consultation",
  "notes": "Additional information"
}
```

```http
GET /api/appointments/my-appointments?status=pending&page=1&limit=10
Authorization: Bearer <jwt_token>
```

### 🩺 Doctor & Hospital Search
```http
GET /api/doctors/search?query=cardiology&page=1&limit=10
GET /api/hospitals/search?query=general&page=1&limit=10
```

### 📍 GPS Verification
```http
POST /api/gps/verify/{appointmentId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

## ⚙️ Advanced Configuration

### 📧 SendGrid Email Setup
1. **Create Account:** Sign up at https://sendgrid.com
2. **API Key Generation:**
   - Navigate to Settings → API Keys
   - Create new API key with Full Access
   - Copy key to `.env` file
3. **Sender Verification:**
   - Verify your FROM_EMAIL address
   - Set up domain authentication (recommended)
4. **Template Customization:** Modify email templates in `/backend/services/emailService.js`

### 📱 GPS Configuration Options
```env
# Distance threshold (meters)
MAX_DISTANCE_METERS=500

# GPS verification timeout (minutes)
GPS_VERIFICATION_TIMEOUT=30

# Automatic cancellation grace period (minutes)
AUTO_CANCEL_GRACE_PERIOD=15
```

### 🗄️ Database Schema Overview

**Core Tables:**
- `Users` - Patient and doctor account information
- `Hospitals` - Healthcare facilities with GPS coordinates
- `Doctors` - Professional profiles linked to users and hospitals
- `Appointments` - Booking records with comprehensive status tracking

**Relationship Structure:**
- Users (1) → Doctors (1) - One doctor profile per user
- Hospitals (1) → Doctors (Many) - Multiple doctors per hospital
- Doctors (1) → Appointments (Many) - Multiple appointments per doctor
- Users (1) → Appointments (Many) - Multiple appointments per patient

## 🔒 Security & Performance

### �️ Security Features
- **JWT Authentication** with secure token expiration
- **Bcrypt Password Hashing** with salt rounds
- **Input Validation** using Joi schemas
- **SQL Injection Protection** via Sequelize ORM
- **Rate Limiting** to prevent API abuse
- **CORS Configuration** for controlled access
- **Helmet.js** security headers
- **Role-based Access Control** (RBAC)

### ⚡ Performance Optimizations
- **Database Indexing** on frequently queried fields
- **Lazy Loading** of related data
- **Background Job Processing** for time-intensive tasks
- **Caching Strategies** for frequently accessed data
- **Optimized Queries** with proper joins and pagination

## 📊 Monitoring & Analytics

### � Built-in Metrics
- Appointment booking success rates
- GPS verification completion rates
- Doctor response times
- Patient satisfaction scores
- System uptime and performance

### 🔍 Logging & Debugging
- Comprehensive request/response logging
- Error tracking with stack traces
- Performance monitoring
- Database query optimization logs

## 🚀 Production Deployment

### 🌐 Environment Setup
```bash
# Production environment variables
NODE_ENV=production
DB_HOST=your_production_db_host
DB_SSL=true
SENDGRID_API_KEY=your_production_sendgrid_key
JWT_SECRET=your_production_jwt_secret
ALLOWED_ORIGINS=https://yourdomain.com

# IMPORTANT: Change admin credentials in production
ADMIN_EMAIL=your_admin@company.com
ADMIN_PASSWORD=your_secure_admin_password
```

### 🔒 Production Security Checklist
- [ ] Change default admin credentials
- [ ] Update JWT_SECRET with strong random string
- [ ] Enable database SSL connections
- [ ] Configure CORS for specific domains only
- [ ] Set up rate limiting for API endpoints
- [ ] Enable HTTPS for geolocation features
- [ ] Review and update SendGrid settings
- [ ] Implement proper backup procedures

### 📦 Build Process
```bash
# Build frontend for production
cd frontend
npm run build

# Start production server
cd ../backend  
npm start
```

### 🐳 Docker Deployment (Optional)
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🛠️ Development Scripts

### 📦 Package Management
```bash
# Root directory commands
npm run dev              # Start both frontend & backend
npm run install-deps     # Install all dependencies
npm run build           # Build frontend for production
npm start              # Production start

# Backend specific
cd backend
npm run dev            # Development with nodemon
npm run seed           # Populate database with sample data
npm start             # Production backend start

# Admin setup scripts
node scripts/create-admin-user.js     # Create admin account
node scripts/check-admin-user.js      # Verify admin setup
node scripts/fix-admin-user-properly.js  # Fix admin login issues
node scripts/test-admin-login-full.js    # Test admin authentication

# Frontend specific  
cd frontend
npm start             # React development server
npm run build         # Build for production
npm test             # Run test suite
```

## 🐛 Troubleshooting Guide

### 🔧 Common Issues & Solutions

**🔐 Admin Login Issues ("Invalid credentials" error)**

If you're getting "Invalid credentials" when trying to login as admin:

1. **Check Admin User Status:**
   ```bash
   cd backend
   node scripts/check-admin-user.js
   ```

2. **Fix Admin Password:**
   ```bash
   node scripts/fix-admin-password.js
   ```

3. **Test Admin Login:**
   ```bash
   node scripts/test-api-login-debug.js
   ```

4. **Reset Admin User Completely:**
   ```bash
   node scripts/create-admin-user.js --force
   ```

**Common Causes:**
- Password hash corruption during database sync
- Multiple admin users with conflicting credentials
- Environment variable issues with JWT_SECRET
- Database connection problems during authentication

**Manual Fix:**
```bash
# Connect to your database and run:
# UPDATE "Users" SET password = '$2a$12$U7PMHY4DqESp5rwCHvJR/uo...' 
# WHERE email = 'admin@doctorstoken.com';
# (Use the hash generated by fix-admin-password.js)
```

**Database Connection Errors**
```bash
# Check PostgreSQL service
sudo service postgresql status

# Test database connection
psql -h localhost -U doctors_token_user -d doctors_token_db

# Reset database (if needed)
cd backend && npm run db:reset
```

**GPS Verification Issues**
- Ensure HTTPS in production (geolocation requirement)
- Check browser location permissions
- Verify hospital GPS coordinates in database
- Test with different devices/browsers

**Email Delivery Problems**
- Verify SendGrid API key validity
- Check sender email domain verification
- Review SendGrid activity dashboard
- Ensure production domain authentication

**Frontend Build Failures**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for dependency conflicts
npm audit fix

# Verify Tailwind CSS configuration
npm run build -- --verbose
```

**Admin Access Issues**
```bash
# Check admin user exists and is active
cd backend
node scripts/check-admin-user.js

# Fix admin login problems
node scripts/fix-admin-user-properly.js

# Test admin authentication
node scripts/test-admin-login-full.js

# Reset admin password (if needed)
node scripts/create-admin-user.js
```

**Analytics Page Errors**
- Ensure admin user is properly authenticated
- Check browser console for JavaScript errors
- Verify backend analytics endpoints are responding
- Clear browser cache and localStorage
- Test with different browsers

### 📞 Getting Help
- 📋 **Create GitHub Issue** with detailed error logs
- 📖 **Check Documentation** for configuration details
- 🔍 **Review API Logs** for debugging information
- � **Community Support** via GitHub Discussions

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### 📋 Development Process
1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Follow** coding standards and conventions
4. **Add** tests for new functionality
5. **Commit** with descriptive messages
6. **Push** to your fork (`git push origin feature/amazing-feature`)
7. **Create** Pull Request with detailed description

### 📝 Code Standards
- **ESLint** configuration for consistent code style
- **Prettier** for automatic code formatting
- **Conventional Commits** for clear commit messages
- **Jest** testing framework for unit tests

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Project Highlights

✨ **Modern Healthcare Solution** - Streamlined appointment management with GPS verification  
🔒 **Enterprise Security** - JWT authentication with role-based access control  
📱 **Mobile-First Design** - Responsive interface optimized for all devices  
🌍 **GPS Integration** - Real-time location verification with automatic cancellation  
📧 **Professional Communication** - Automated email notifications and reminder system  
⚡ **High Performance** - Optimized database queries with intelligent caching  
🛡️ **Production Ready** - Comprehensive security, monitoring, and admin tools  
📊 **Business Intelligence** - Advanced analytics dashboard with export capabilities  
🔧 **Developer Friendly** - Well-documented API with comprehensive setup scripts  

**Built with ❤️ for better healthcare management**

---

**For support:** Create an issue • **For updates:** Watch this repository • **For discussions:** Join our community
