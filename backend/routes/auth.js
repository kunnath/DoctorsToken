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

    // Find user
    const user = await User.findOne({ 
      where: { email, isActive: true }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

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
        return res.status(400).json({ message: 'Doctor profile already exists' });
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
