const express = require('express');
const { Op } = require('sequelize');
const { Hospital, Doctor, User } = require('../models');

const router = express.Router();

// Search hospitals
router.get('/search', async (req, res) => {
  try {
    const { 
      query, 
      page = 1, 
      limit = 10 
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = { isActive: true };

    // Search by hospital name
    if (query) {
      whereClause.name = { [Op.iLike]: `%${query}%` };
    }

    const hospitals = await Hospital.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Doctor,
          as: 'doctors',
          where: { isActive: true },
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      hospitals: hospitals.rows,
      pagination: {
        total: hospitals.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(hospitals.count / limit)
      }
    });
  } catch (error) {
    console.error('Hospital search error:', error);
    res.status(500).json({ message: 'Server error searching hospitals' });
  }
});

// Get hospital details
router.get('/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const hospital = await Hospital.findByPk(hospitalId, {
      include: [
        {
          model: Doctor,
          as: 'doctors',
          where: { isActive: true },
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone']
            }
          ]
        }
      ]
    });

    if (!hospital || !hospital.isActive) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json({ hospital });
  } catch (error) {
    console.error('Hospital fetch error:', error);
    res.status(500).json({ message: 'Server error fetching hospital' });
  }
});

// Get doctors by hospital
router.get('/:hospitalId/doctors', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { specialization, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = { hospitalId, isActive: true };

    if (specialization) {
      whereClause.specialization = { [Op.iLike]: `%${specialization}%` };
    }

    const doctors = await Doctor.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
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
    console.error('Hospital doctors fetch error:', error);
    res.status(500).json({ message: 'Server error fetching hospital doctors' });
  }
});

module.exports = router;
