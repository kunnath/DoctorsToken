# 🏥 Doctors Token System

A comprehensive full-stack appointment booking system with GPS verification for healthcare providers and patients.

## 🎯 Features

### 🩺 For Patients
- **User Registration & Authentication** - Secure JWT-based authentication
- **Doctor & Hospital Search** - Find doctors by name or specialization, search hospitals
- **Appointment Booking** - Schedule appointments with preferred doctors
- **GPS Location Verification** - Real-time location verification on appointment day
- **Appointment Management** - View, cancel, and track appointment status
- **Email Notifications** - Receive updates on appointment status changes

### 👨‍⚕️ For Doctors  
- **Professional Dashboard** - Review and manage patient appointments
- **Appointment Approval/Rejection** - Control your schedule with approval workflow
- **Patient Information** - Access patient details and appointment history
- **Automated Notifications** - Get notified of new appointment requests

### 🏥 System Features
- **GPS-Based Validation** - Automatic cancellation if patient is >500m from hospital
- **Email Integration** - SendGrid powered email notifications
- **Background Scheduling** - Node-cron for automated appointment monitoring
- **Real-time Updates** - Live status updates and notifications
- **Responsive Design** - Mobile-friendly interface with Tailwind CSS

## 🛠 Technology Stack

### Backend
- **Node.js & Express.js** - RESTful API server
- **PostgreSQL** - Primary database with Sequelize ORM
- **JWT Authentication** - Secure token-based authentication
- **SendGrid** - Email notification service
- **Node-cron** - Background job scheduling
- **Geolib** - GPS distance calculations using Haversine formula

### Frontend
- **React 18** - Modern user interface
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Form handling and validation
- **React Hot Toast** - User notifications
- **Date-fns** - Date manipulation and formatting
- **Lucide React** - Beautiful icon library

### Development Tools
- **Concurrently** - Run frontend and backend simultaneously
- **Nodemon** - Auto-restart development server
- **PostCSS & Autoprefixer** - CSS processing

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- SendGrid account (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DoctorsToken
   ```

2. **Install dependencies**
   ```bash
   npm run install-deps
   ```

3. **Database Setup**
   
   Create a PostgreSQL database:
   ```sql
   CREATE DATABASE doctors_token_db;
   ```

4. **Environment Configuration**
   
   Copy and configure backend environment:
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=doctors_token_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # JWT Secret (generate a strong secret)
   JWT_SECRET=your_super_secret_jwt_key
   
   # SendGrid (get API key from SendGrid dashboard)
   SENDGRID_API_KEY=your_sendgrid_api_key
   FROM_EMAIL=noreply@doctorstoken.com
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # GPS Configuration
   MAX_DISTANCE_METERS=500
   ```

5. **Database Migration & Seeding**
   ```bash
   cd backend
   npm run seed
   ```

6. **Start Development Servers**
   ```bash
   # From project root
   npm run dev
   ```
   
   This starts:
   - Backend server: http://localhost:5000
   - Frontend app: http://localhost:3000

## 🔑 Demo Credentials

### Patient Accounts
- **Email:** john.patient@email.com | **Password:** password123
- **Email:** jane.smith@email.com | **Password:** password123

### Doctor Accounts  
- **Email:** dr.wilson@email.com | **Password:** doctor123
- **Email:** dr.brown@email.com | **Password:** doctor123

## 📱 Usage Guide

### For Patients

1. **Registration**
   - Visit http://localhost:3000/register
   - Choose "Patient" role and fill out the form
   - You'll be automatically logged in after registration

2. **Booking an Appointment**
   - Navigate to "Book Appointment"
   - Search for doctors by name or hospitals
   - Select your preferred doctor and time slot
   - Provide reason for visit and any additional notes
   - Submit your request

3. **Managing Appointments**
   - View all appointments in "My Appointments"
   - Filter by status (pending, approved, rejected, etc.)
   - Cancel appointments if needed
   - Track appointment tokens for approved appointments

4. **GPS Verification**
   - On your appointment day, you'll see a "Verify Location" button
   - Click to allow location access
   - System verifies you're within 500m of the hospital
   - Appointment may be cancelled if you're too far away

### For Doctors

1. **Registration**
   - Register with "Doctor" role
   - Complete your professional profile with:
     - Hospital affiliation
     - Specialization
     - License number
     - Available hours
     - Consultation fees

2. **Managing Appointments**
   - Review incoming appointment requests in the Doctor Dashboard
   - Approve or reject appointments with optional notes
   - View patient contact information
   - Monitor GPS verification status

3. **Schedule Management**
   - View your approved appointments
   - See upcoming appointments for today
   - Access patient details and appointment history

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/doctor-profile` - Create doctor profile

### Appointments
- `POST /api/appointments` - Book new appointment
- `GET /api/appointments/my-appointments` - Get user's appointments
- `PATCH /api/appointments/:id/status` - Update appointment status (doctors)
- `PATCH /api/appointments/:id/cancel` - Cancel appointment

### Doctors & Hospitals
- `GET /api/doctors/search` - Search doctors
- `GET /api/hospitals/search` - Search hospitals
- `GET /api/doctors/specializations/list` - Get specializations

### GPS Verification
- `POST /api/gps/verify/:appointmentId` - Verify patient location
- `GET /api/gps/status/:appointmentId` - Get GPS verification status

## 🔧 Configuration

### Email Setup (SendGrid)
1. Create a SendGrid account at https://sendgrid.com
2. Generate an API key in your SendGrid dashboard
3. Add the API key to your `.env` file
4. Verify your sender email address in SendGrid

### GPS Configuration
- `MAX_DISTANCE_METERS`: Maximum allowed distance from hospital (default: 500m)
- The system uses the Haversine formula for accurate distance calculations
- GPS verification runs automatically via scheduled jobs

### Database Schema
The system includes the following main tables:
- `Users` - Patient and doctor accounts
- `Hospitals` - Healthcare facilities with GPS coordinates
- `Doctors` - Doctor profiles linked to users and hospitals  
- `Appointments` - Appointment bookings with status tracking

## 📋 Available Scripts

### Root Directory
- `npm run dev` - Start both frontend and backend in development
- `npm run install-deps` - Install all dependencies
- `npm start` - Production start (build frontend first)

### Backend Directory
- `npm run dev` - Start backend with nodemon
- `npm run seed` - Populate database with sample data
- `npm start` - Production backend start

### Frontend Directory
- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt for secure password storage
- **Input Validation** - Joi validation for all API inputs
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Controlled cross-origin requests
- **Helmet.js** - Security headers
- **Role-based Access** - Separate patient and doctor permissions

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your_production_db_host
SENDGRID_API_KEY=your_production_sendgrid_key
JWT_SECRET=your_production_jwt_secret
```

### Build Process
```bash
# Build frontend
cd frontend && npm run build

# Start production server  
cd backend && npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error**
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists

**GPS Not Working**
- Ensure HTTPS in production (required for geolocation)
- Check browser location permissions
- Verify GPS coordinates in hospital data

**Email Not Sending**
- Verify SendGrid API key
- Check sender email verification
- Review SendGrid dashboard for errors

**Frontend Build Errors**
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check for Tailwind CSS configuration issues

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

Built with ❤️ for better healthcare management
# DoctorsToken
