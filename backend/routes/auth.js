const express = require('express');
const jwt = require('jsonwebtoken');
const { User, Doctor, Hospital } = require('../models');
const { validate, registerValidation, loginValidation, doctorProfileValidation } = require('../middleware/validation');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', validate(registerValidation), async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
    });

    // If registering as a doctor, create a basic doctor profile
    let doctorProfile = null;
    if (role === 'doctor') {
      try {
        // Get the first available hospital as default
        const defaultHospital = await Hospital.findOne({ where: { isActive: true } });
        
        if (defaultHospital) {
          doctorProfile = await Doctor.create({
            userId: user.id,
            hospitalId: defaultHospital.id,
            specialization: 'General Medicine', // Default specialization
            licenseNumber: `LIC-${Date.now()}`, // Temporary license number
            experience: 0,
            consultationFee: 500, // Default fee
            availableFrom: '09:00',
            availableTo: '17:00',
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            bio: `Dr. ${name} - General Medicine practitioner. Please update your profile with complete details.`,
            isActive: true
          });
          console.log('Default doctor profile created for user:', user.id);
        } else {
          console.log('No hospitals available, doctor profile not created');
        }
      } catch (profileError) {
        console.error('Error creating doctor profile:', profileError);
        // Continue with registration even if profile creation fails
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        doctorProfile: doctorProfile || null,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', validate(loginValidation), async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    console.log('Request origin:', req.get('Origin'));

    // Find user
    const user = await User.findOne({ 
      where: { email, isActive: true }
    });

    if (!user) {
      console.log('User not found or inactive:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', { id: user.id, email: user.email, role: user.role });

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Password matched for user:', email);

    // Load doctor profile if user is a doctor
    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ where: { userId: user.id } });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', email, 'role:', user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        doctorProfile: doctorProfile || null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ 
        where: { userId: user.id },
        include: [{ model: Hospital, as: 'hospital' }]
      });
    }

    res.json({ 
      user: {
        ...user.toJSON(),
        doctorProfile: doctorProfile || null
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Create doctor profile (for doctors only)
router.post('/doctor-profile', 
  authMiddleware, 
  roleMiddleware(['doctor']), 
  validate(doctorProfileValidation), 
  async (req, res) => {
    try {
      const {
        hospitalId,
        specialization,
        licenseNumber,
        experience,
        consultationFee,
        availableFrom,
        availableTo,
        workingDays,
        bio,
      } = req.body;

      // Check if doctor profile already exists
      const existingProfile = await Doctor.findOne({ where: { userId: req.user.id } });
      if (existingProfile) {
        // If profile exists, update it instead of creating a new one
        await existingProfile.update({
          hospitalId,
          specialization,
          licenseNumber,
          experience,
          consultationFee,
          availableFrom,
          availableTo,
          workingDays,
          bio,
        });

        return res.status(200).json({
          message: 'Doctor profile updated successfully',
          doctorProfile: existingProfile,
        });
      }

      // Create doctor profile
      const doctorProfile = await Doctor.create({
        userId: req.user.id,
        hospitalId,
        specialization,
        licenseNumber,
        experience,
        consultationFee,
        availableFrom,
        availableTo,
        workingDays,
        bio,
      });

      res.status(201).json({
        message: 'Doctor profile created successfully',
        doctorProfile,
      });
    } catch (error) {
      console.error('Doctor profile creation error:', error);
      res.status(500).json({ message: 'Server error creating doctor profile' });
    }
  }
);

module.exports = router;
