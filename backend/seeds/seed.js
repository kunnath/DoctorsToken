const { User, Hospital, Doctor } = require('../models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('Starting database seeding...');

    // Create hospitals
    const hospitals = await Hospital.bulkCreate([
      {
        name: 'City General Hospital',
        address: '123 Main Street, Downtown, City',
        latitude: 40.7128,
        longitude: -74.0060,
        phone: '+1-555-0101',
        email: 'info@citygeneral.com',
        website: 'https://citygeneral.com',
        description: 'A leading healthcare provider with state-of-the-art facilities.'
      },
      {
        name: 'Metropolitan Medical Center',
        address: '456 Oak Avenue, Midtown, City',
        latitude: 40.7589,
        longitude: -73.9851,
        phone: '+1-555-0102',
        email: 'contact@metromedical.com',
        website: 'https://metromedical.com',
        description: 'Comprehensive medical care with specialized departments.'
      },
      {
        name: 'Riverside Healthcare',
        address: '789 River Road, Eastside, City',
        latitude: 40.7282,
        longitude: -73.7949,
        phone: '+1-555-0103',
        email: 'info@riverside.com',
        website: 'https://riverside.com',
        description: 'Community-focused healthcare with personalized attention.'
      }
    ]);

    console.log('Hospitals created successfully');

    // Create users (patients and doctors)
    const users = await User.bulkCreate([
      // Patients
      {
        name: 'John Patient',
        email: 'john.patient@email.com',
        password: await bcrypt.hash('password123', 12),
        role: 'patient',
        phone: '+1-555-1001'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        password: await bcrypt.hash('password123', 12),
        role: 'patient',
        phone: '+1-555-1002'
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@email.com',
        password: await bcrypt.hash('password123', 12),
        role: 'patient',
        phone: '+1-555-1003'
      },
      // Doctors
      {
        name: 'Dr. Sarah Wilson',
        email: 'dr.wilson@email.com',
        password: await bcrypt.hash('doctor123', 12),
        role: 'doctor',
        phone: '+1-555-2001'
      },
      {
        name: 'Dr. Michael Brown',
        email: 'dr.brown@email.com',
        password: await bcrypt.hash('doctor123', 12),
        role: 'doctor',
        phone: '+1-555-2002'
      },
      {
        name: 'Dr. Emily Davis',
        email: 'dr.davis@email.com',
        password: await bcrypt.hash('doctor123', 12),
        role: 'doctor',
        phone: '+1-555-2003'
      },
      {
        name: 'Dr. Robert Taylor',
        email: 'dr.taylor@email.com',
        password: await bcrypt.hash('doctor123', 12),
        role: 'doctor',
        phone: '+1-555-2004'
      },
      {
        name: 'Dr. Lisa Anderson',
        email: 'dr.anderson@email.com',
        password: await bcrypt.hash('doctor123', 12),
        role: 'doctor',
        phone: '+1-555-2005'
      }
    ]);

    console.log('Users created successfully');

    // Create doctor profiles
    const doctorUsers = users.filter(user => user.role === 'doctor');
    
    const doctors = await Doctor.bulkCreate([
      {
        userId: doctorUsers[0].id,
        hospitalId: hospitals[0].id,
        specialization: 'Cardiology',
        licenseNumber: 'MD-001-2024',
        experience: 15,
        consultationFee: 150.00,
        availableFrom: '09:00',
        availableTo: '17:00',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        bio: 'Experienced cardiologist specializing in heart disease prevention and treatment.'
      },
      {
        userId: doctorUsers[1].id,
        hospitalId: hospitals[0].id,
        specialization: 'Pediatrics',
        licenseNumber: 'MD-002-2024',
        experience: 12,
        consultationFee: 120.00,
        availableFrom: '08:00',
        availableTo: '16:00',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        bio: 'Dedicated pediatrician with expertise in child healthcare and development.'
      },
      {
        userId: doctorUsers[2].id,
        hospitalId: hospitals[1].id,
        specialization: 'Orthopedics',
        licenseNumber: 'MD-003-2024',
        experience: 18,
        consultationFee: 180.00,
        availableFrom: '10:00',
        availableTo: '18:00',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        bio: 'Orthopedic surgeon specializing in bone and joint disorders.'
      },
      {
        userId: doctorUsers[3].id,
        hospitalId: hospitals[1].id,
        specialization: 'Dermatology',
        licenseNumber: 'MD-004-2024',
        experience: 10,
        consultationFee: 130.00,
        availableFrom: '09:30',
        availableTo: '17:30',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        bio: 'Dermatologist focused on skin health and cosmetic procedures.'
      },
      {
        userId: doctorUsers[4].id,
        hospitalId: hospitals[2].id,
        specialization: 'Internal Medicine',
        licenseNumber: 'MD-005-2024',
        experience: 20,
        consultationFee: 140.00,
        availableFrom: '08:30',
        availableTo: '16:30',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        bio: 'Internal medicine physician with comprehensive primary care expertise.'
      }
    ]);

    console.log('Doctor profiles created successfully');
    console.log('Database seeding completed!');

    // Log sample credentials
    console.log('\n=== Sample Login Credentials ===');
    console.log('Patient Accounts:');
    console.log('Email: john.patient@email.com | Password: password123');
    console.log('Email: jane.smith@email.com | Password: password123');
    console.log('\nDoctor Accounts:');
    console.log('Email: dr.wilson@email.com | Password: doctor123');
    console.log('Email: dr.brown@email.com | Password: doctor123');
    console.log('Email: dr.davis@email.com | Password: doctor123');

  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
};

module.exports = { seedData };
