const express = require('express');
const { Op } = require('sequelize');
const { User, Doctor, Hospital, Appointment } = require('../models');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total counts
    const totalUsers = await User.count();
    const totalPatients = await User.count({ where: { role: 'patient' } });
    const totalDoctors = await User.count({ where: { role: 'doctor' } });
    const totalHospitals = await Hospital.count();
    const totalAppointments = await Appointment.count();

    // Recent registrations
    const newUsersThisMonth = await User.count({
      where: { createdAt: { [Op.gte]: lastMonth } }
    });
    const newPatientsThisMonth = await User.count({
      where: { role: 'patient', createdAt: { [Op.gte]: lastMonth } }
    });
    const newDoctorsThisMonth = await User.count({
      where: { role: 'doctor', createdAt: { [Op.gte]: lastMonth } }
    });

    // Appointment statistics
    const appointmentStats = await Appointment.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: ['status']
    });

    const appointmentsByStatus = appointmentStats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.dataValues.count);
      return acc;
    }, {});

    // Recent appointments
    const recentAppointments = await Appointment.count({
      where: { createdAt: { [Op.gte]: lastWeek } }
    });

    // Monthly appointment trends (last 6 months)
    const monthlyAppointments = [];
    for (let i = 5; i >= 0; i--) {
      const startDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      
      const count = await Appointment.count({
        where: {
          createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        }
      });

      monthlyAppointments.push({
        month: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count
      });
    }

    // Top performing doctors (by appointment count)
    const topDoctors = await Appointment.findAll({
      attributes: [
        'doctorId',
        [require('sequelize').fn('COUNT', '*'), 'appointmentCount']
      ],
      include: [{
        model: Doctor,
        as: 'doctor',
        include: [{ model: User, as: 'user', attributes: ['name'] }]
      }],
      group: ['doctorId', 'doctor.id', 'doctor.user.id'],
      order: [[require('sequelize').fn('COUNT', '*'), 'DESC']],
      limit: 5
    });

    // Hospital utilization
    const hospitalStats = await Appointment.findAll({
      attributes: [
        'hospitalId',
        [require('sequelize').fn('COUNT', '*'), 'appointmentCount']
      ],
      include: [{
        model: Hospital,
        as: 'hospital',
        attributes: ['name', 'address']
      }],
      group: ['hospitalId', 'hospital.id'],
      order: [[require('sequelize').fn('COUNT', '*'), 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          patients: totalPatients,
          doctors: totalDoctors,
          hospitals: totalHospitals,
          appointments: totalAppointments
        },
        growth: {
          newUsersThisMonth,
          newPatientsThisMonth,
          newDoctorsThisMonth,
          recentAppointments
        },
        appointmentsByStatus,
        monthlyAppointments,
        topDoctors: topDoctors.map(d => ({
          doctorName: d.doctor.user.name,
          appointmentCount: parseInt(d.dataValues.appointmentCount)
        })),
        hospitalStats: hospitalStats.map(h => ({
          hospitalName: h.hospital.name,
          appointmentCount: parseInt(h.dataValues.appointmentCount)
        }))
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Get all users with pagination and filters
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (role && role !== 'all') {
      whereClause.role = role;
    }
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: {
        users: users.rows,
        pagination: {
          total: users.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(users.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get detailed user info
router.get('/users/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Doctor,
          as: 'doctorProfile',
          include: [{ model: Hospital, as: 'hospital' }]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's appointment history
    let appointments = [];
    if (user.role === 'patient') {
      appointments = await Appointment.findAll({
        where: { patientId: userId },
        include: [
          { model: Doctor, as: 'doctor', include: [{ model: User, as: 'user' }] },
          { model: Hospital, as: 'hospital' }
        ],
        order: [['appointmentDate', 'DESC']]
      });
    } else if (user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ where: { userId } });
      if (doctorProfile) {
        appointments = await Appointment.findAll({
          where: { doctorId: doctorProfile.id },
          include: [
            { model: User, as: 'patient' },
            { model: Hospital, as: 'hospital' }
          ],
          order: [['appointmentDate', 'DESC']]
        });
      }
    }

    res.json({
      success: true,
      data: {
        user,
        appointments,
        stats: {
          totalAppointments: appointments.length,
          completedAppointments: appointments.filter(a => a.status === 'completed').length,
          cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length
        }
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
});

// Get all doctors with their details
router.get('/doctors', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, specialty, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    const userWhereClause = {};
    
    if (specialty) {
      whereClause.specialty = { [Op.iLike]: `%${specialty}%` };
    }
    if (search) {
      userWhereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const doctors = await Doctor.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          where: userWhereClause,
          attributes: { exclude: ['password'] }
        },
        { model: Hospital, as: 'hospital' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[{ model: User, as: 'user' }, sortBy, sortOrder.toUpperCase()]]
    });

    // Get appointment stats for each doctor
    const doctorsWithStats = await Promise.all(
      doctors.rows.map(async (doctor) => {
        const appointmentStats = await Appointment.findAll({
          where: { doctorId: doctor.id },
          attributes: [
            'status',
            [require('sequelize').fn('COUNT', '*'), 'count']
          ],
          group: ['status']
        });

        const stats = appointmentStats.reduce((acc, stat) => {
          acc[stat.status] = parseInt(stat.dataValues.count);
          return acc;
        }, {});

        return {
          ...doctor.toJSON(),
          appointmentStats: stats
        };
      })
    );

    res.json({
      success: true,
      data: {
        doctors: doctorsWithStats,
        pagination: {
          total: doctors.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(doctors.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Failed to fetch doctors' });
  }
});

// Get all appointments with filters
router.get('/appointments', adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      dateFrom, 
      dateTo, 
      search,
      sortBy = 'appointmentDate',
      sortOrder = 'DESC' 
    } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    if (dateFrom && dateTo) {
      whereClause.appointmentDate = {
        [Op.between]: [dateFrom, dateTo]
      };
    }

    const includeClause = [
      { 
        model: User, 
        as: 'patient',
        attributes: { exclude: ['password'] }
      },
      { 
        model: Doctor, 
        as: 'doctor',
        include: [{ 
          model: User, 
          as: 'user',
          attributes: { exclude: ['password'] }
        }]
      },
      { model: Hospital, as: 'hospital' }
    ];

    // Add search functionality
    if (search) {
      const searchCondition = {
        [Op.or]: [
          { '$patient.name$': { [Op.iLike]: `%${search}%` } },
          { '$doctor.user.name$': { [Op.iLike]: `%${search}%` } },
          { '$hospital.name$': { [Op.iLike]: `%${search}%` } },
          { appointmentToken: { [Op.iLike]: `%${search}%` } }
        ]
      };
      Object.assign(whereClause, searchCondition);
    }

    const appointments = await Appointment.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.json({
      success: true,
      data: {
        appointments: appointments.rows,
        pagination: {
          total: appointments.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(appointments.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

// Update user status (activate/deactivate)
router.patch('/users/:userId/status', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ isActive });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user: { ...user.toJSON(), password: undefined } }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Delete user (soft delete by deactivating)
router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete by deactivating
    await user.update({ isActive: false });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Get system analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let dateFilter;
    const now = new Date();
    
    switch (period) {
      case '24h':
        dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // User registration trends
    const userRegistrations = await User.findAll({
      attributes: [
        [require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'date'],
        'role',
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      where: {
        createdAt: { [Op.gte]: dateFilter }
      },
      group: [
        require('sequelize').fn('DATE', require('sequelize').col('createdAt')),
        'role'
      ],
      order: [[require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'ASC']]
    });

    // Appointment trends
    const appointmentTrends = await Appointment.findAll({
      attributes: [
        [require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'date'],
        'status',
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      where: {
        createdAt: { [Op.gte]: dateFilter }
      },
      group: [
        require('sequelize').fn('DATE', require('sequelize').col('createdAt')),
        'status'
      ],
      order: [[require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'ASC']]
    });

    // Peak hours analysis
    const peakHours = await Appointment.findAll({
      attributes: [
        'appointmentTime',
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      where: {
        createdAt: { [Op.gte]: dateFilter },
        status: { [Op.ne]: 'cancelled' }
      },
      group: ['appointmentTime'],
      order: [[require('sequelize').fn('COUNT', '*'), 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        period,
        userRegistrations,
        appointmentTrends,
        peakHours: peakHours.map(ph => ({
          time: ph.appointmentTime,
          count: parseInt(ph.dataValues.count)
        }))
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

module.exports = router;
