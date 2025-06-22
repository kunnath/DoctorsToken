const { User, Doctor, Hospital } = require('../models');

async function createMissingDoctorProfiles() {
  try {
    console.log('Starting migration: Create missing doctor profiles...');

    // Find all users with role 'doctor' who don't have a doctor profile
    const doctorUsers = await User.findAll({
      where: { role: 'doctor' },
      include: [{
        model: Doctor,
        as: 'doctorProfile',
        required: false
      }]
    });

    const usersWithoutProfile = doctorUsers.filter(user => !user.doctorProfile);
    
    if (usersWithoutProfile.length === 0) {
      console.log('No doctor users without profiles found.');
      return;
    }

    console.log(`Found ${usersWithoutProfile.length} doctor users without profiles.`);

    // Get the first available hospital
    const defaultHospital = await Hospital.findOne({ where: { isActive: true } });
    
    if (!defaultHospital) {
      console.error('No active hospitals found. Cannot create doctor profiles.');
      return;
    }

    console.log(`Using default hospital: ${defaultHospital.name}`);

    // Create profiles for users without them
    for (const user of usersWithoutProfile) {
      try {
        const doctorProfile = await Doctor.create({
          userId: user.id,
          hospitalId: defaultHospital.id,
          specialization: 'General Medicine',
          licenseNumber: `LIC-${Date.now()}-${user.id.substring(0, 8)}`,
          experience: 0,
          consultationFee: 500,
          availableFrom: '09:00',
          availableTo: '17:00',
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          bio: `Dr. ${user.name} - General Medicine practitioner. Please update your profile with complete details.`,
          isActive: true
        });

        console.log(`✓ Created profile for Dr. ${user.name} (${user.email})`);
      } catch (error) {
        console.error(`✗ Failed to create profile for ${user.name}:`, error.message);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration if called directly
if (require.main === module) {
  createMissingDoctorProfiles()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}

module.exports = createMissingDoctorProfiles;
