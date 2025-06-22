const express = require('express');
const { Op } = require('sequelize');
const { Doctor, User, Hospital } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Search doctors
router.get('/search', async (req, res) => {
  try {
    const { 
      query, 
      specialization, 
      hospitalId, 
      page = 1, 
      limit = 10 
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = { isActive: true };
    let userWhereClause = {};
    let hospitalWhereClause = {};

    // Search by doctor name or hospital name
    if (query) {
      userWhereClause[Op.or] = [
        { name: { [Op.iLike]: `%${query}%` } }
      ];
      hospitalWhereClause[Op.or] = [
        { name: { [Op.iLike]: `%${query}%` } }
      ];
    }

    // Filter by specialization
    if (specialization) {
      whereClause.specialization = { [Op.iLike]: `%${specialization}%` };
    }

    // Filter by hospital
    if (hospitalId) {
      whereClause.hospitalId = hospitalId;
    }

    const doctors = await Doctor.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined,
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Hospital,
          as: 'hospital',
          where: Object.keys(hospitalWhereClause).length > 0 ? hospitalWhereClause : undefined,
          attributes: ['id', 'name', 'address', 'phone', 'latitude', 'longitude']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      doctors: doctors.rows,
      pagination: {
        total: doctors.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(doctors.count / limit)
      }
    });
  } catch (error) {
    console.error('Doctor search error:', error);
    res.status(500).json({ message: 'Server error searching doctors' });
  }
});

// Get doctor details
router.get('/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findByPk(doctorId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Hospital,
          as: 'hospital',
          attributes: ['id', 'name', 'address', 'phone', 'email', 'website', 'latitude', 'longitude']
        }
      ]
    });

    if (!doctor || !doctor.isActive) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ doctor });
  } catch (error) {
    console.error('Doctor fetch error:', error);
    res.status(500).json({ message: 'Server error fetching doctor' });
  }
});

// Get all specializations
router.get('/specializations/list', async (req, res) => {
  try {
    const specializations = await Doctor.findAll({
      attributes: ['specialization'],
      where: { isActive: true },
      group: ['specialization'],
      order: [['specialization', 'ASC']]
    });

    const specializationList = specializations.map(s => s.specialization);

    res.json({ specializations: specializationList });
  } catch (error) {
    console.error('Specializations fetch error:', error);
    res.status(500).json({ message: 'Server error fetching specializations' });
  }
});

// Update doctor profile (doctors only)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can update doctor profiles' });
    }

    const doctorProfile = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const {
      specialization,
      experience,
      consultationFee,
      availableFrom,
      availableTo,
      workingDays,
      bio
    } = req.body;

    await doctorProfile.update({
      specialization: specialization || doctorProfile.specialization,
      experience: experience !== undefined ? experience : doctorProfile.experience,
      consultationFee: consultationFee !== undefined ? consultationFee : doctorProfile.consultationFee,
      availableFrom: availableFrom || doctorProfile.availableFrom,
      availableTo: availableTo || doctorProfile.availableTo,
      workingDays: workingDays || doctorProfile.workingDays,
      bio: bio !== undefined ? bio : doctorProfile.bio
    });

    res.json({
      message: 'Doctor profile updated successfully',
      doctorProfile
    });
  } catch (error) {
    console.error('Doctor profile update error:', error);
    res.status(500).json({ message: 'Server error updating doctor profile' });
  }
});

module.exports = router;
