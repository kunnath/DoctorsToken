const express = require('express');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { Appointment, User, Doctor, Hospital } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { validate, appointmentValidation } = require('../middleware/validation');
const emailService = require('../services/emailService');

const router = express.Router();

// Book appointment (patients only)
router.post('/', 
  authMiddleware, 
  roleMiddleware(['patient']), 
  validate(appointmentValidation), 
  async (req, res) => {
    try {
      const { doctorId, hospitalId, appointmentDate, appointmentTime, reason, notes } = req.body;

      // Check if doctor exists and is active
      const doctor = await Doctor.findByPk(doctorId, {
        include: [
          { model: User, as: 'user' },
          { model: Hospital, as: 'hospital' }
        ]
      });

      if (!doctor || !doctor.isActive) {
        return res.status(404).json({ message: 'Doctor not found or inactive' });
      }

      // Check if hospital matches
      if (doctor.hospitalId !== hospitalId) {
        return res.status(400).json({ message: 'Doctor does not work at the specified hospital' });
      }

      // Check if appointment slot is available
      const existingAppointment = await Appointment.findOne({
        where: {
          doctorId,
          appointmentDate,
          appointmentTime,
          status: {
            [Op.in]: ['pending', 'approved']
          }
        }
      });

      if (existingAppointment) {
        return res.status(400).json({ message: 'This time slot is already booked' });
      }

      // Create appointment with token
      const appointmentToken = `APT-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      const appointment = await Appointment.create({
        patientId: req.user.id,
        doctorId,
        hospitalId,
        appointmentDate,
        appointmentTime,
        reason,
        notes,
        status: 'pending',
        appointmentToken
      });

      // Send notification email to doctor
      await emailService.sendAppointmentRequestEmail(
        doctor.user.email,
        doctor.user.name,
        req.user.name,
        appointmentDate,
        appointmentTime,
        reason
      );

      res.status(201).json({
        message: 'Appointment booked successfully',
        appointment: {
          ...appointment.toJSON(),
          appointmentToken
        }
      });
    } catch (error) {
      console.error('Appointment booking error:', error);
      res.status(500).json({ message: 'Server error booking appointment' });
    }
  }
);

// Get user's appointments
router.get('/my-appointments', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    console.log('Fetching appointments for user:', req.user.id, 'role:', req.user.role);

    let whereClause = {};
    if (req.user.role === 'patient') {
      whereClause.patientId = req.user.id;
      console.log('Patient appointments query:', whereClause);
    } else if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ where: { userId: req.user.id } });
      console.log('Doctor profile found:', doctorProfile ? 'yes' : 'no');
      
      if (!doctorProfile) {
        console.log('No doctor profile found for user:', req.user.id);
        // Return empty appointments instead of error for doctors without profile
        return res.json({
          appointments: [],
          pagination: {
            total: 0,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: 0
          }
        });
      }
      whereClause.doctorId = doctorProfile.id;
      console.log('Doctor appointments query:', whereClause);
    }

    if (status) {
      whereClause.status = status;
    }

    console.log('Final where clause:', whereClause);

    const appointments = await Appointment.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'patient', attributes: ['id', 'name', 'email', 'phone'] },
        { 
          model: Doctor, 
          as: 'doctor',
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
            { model: Hospital, as: 'hospital', attributes: ['id', 'name', 'address'] }
          ]
        },
        { model: Hospital, as: 'hospital', attributes: ['id', 'name', 'address', 'latitude', 'longitude'] }
      ],
      order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log('Found appointments count:', appointments.count);

    res.json({
      appointments: appointments.rows,
      pagination: {
        total: appointments.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(appointments.count / limit)
      }
    });
  } catch (error) {
    console.error('Fetch appointments error:', error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
});

// Approve/Reject appointment (doctors only)
router.patch('/:appointmentId/status', 
  authMiddleware, 
  roleMiddleware(['doctor']), 
  async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const { status, doctorNotes } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be approved or rejected' });
      }

      // Find appointment
      const appointment = await Appointment.findByPk(appointmentId, {
        include: [
          { model: User, as: 'patient' },
          { 
            model: Doctor, 
            as: 'doctor',
            include: [{ model: User, as: 'user' }]
          },
          { model: Hospital, as: 'hospital' }
        ]
      });

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Check if doctor owns this appointment
      const doctorProfile = await Doctor.findOne({ where: { userId: req.user.id } });
      if (appointment.doctorId !== doctorProfile.id) {
        return res.status(403).json({ message: 'You can only manage your own appointments' });
      }

      if (appointment.status !== 'pending') {
        return res.status(400).json({ message: 'Only pending appointments can be approved or rejected' });
      }

      // Update appointment
      await appointment.update({
        status,
        doctorNotes
      });

      // Send email notification to patient
      if (status === 'approved') {
        await emailService.sendAppointmentApprovalEmail(
          appointment.patient.email,
          appointment.patient.name,
          appointment.doctor.user.name,
          appointment.hospital.name,
          appointment.appointmentDate,
          appointment.appointmentTime,
          appointment.appointmentToken
        );
      } else {
        await emailService.sendAppointmentRejectionEmail(
          appointment.patient.email,
          appointment.patient.name,
          appointment.doctor.user.name,
          appointment.appointmentDate,
          appointment.appointmentTime,
          doctorNotes
        );
      }

      res.json({
        message: `Appointment ${status} successfully`,
        appointment
      });
    } catch (error) {
      console.error('Appointment status update error:', error);
      res.status(500).json({ message: 'Server error updating appointment status' });
    }
  }
);

// Cancel appointment
router.patch('/:appointmentId/cancel', authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason, token } = req.body;

    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: User, as: 'patient' },
        { 
          model: Doctor, 
          as: 'doctor',
          include: [{ model: User, as: 'user' }]
        },
        { model: Hospital, as: 'hospital' }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user can cancel this appointment or has valid token
    const canCancel = 
      (req.user.role === 'patient' && appointment.patientId === req.user.id) ||
      (req.user.role === 'doctor' && appointment.doctor.userId === req.user.id) ||
      (token && appointment.appointmentToken === token);

    if (!canCancel) {
      return res.status(403).json({ message: 'You can only cancel your own appointments' });
    }

    if (!['pending', 'approved'].includes(appointment.status)) {
      return res.status(400).json({ message: 'This appointment cannot be cancelled' });
    }

    // Update appointment
    await appointment.update({
      status: 'cancelled',
      notes: reason || 'Cancelled by user'
    });

    // Send notification emails
    try {
      // Send confirmation to patient
      await emailService.sendCancellationConfirmationToPatient(
        appointment.patient.email,
        appointment.patient.name,
        appointment.doctor.user.name,
        appointment.hospital.name,
        appointment.appointmentDate,
        appointment.appointmentTime,
        appointment.appointmentToken
      );

      // Send notification to doctor
      await emailService.sendCancellationNotificationToDoctor(
        appointment.doctor.user.email,
        appointment.doctor.user.name,
        appointment.patient.name,
        appointment.appointmentDate,
        appointment.appointmentTime,
        appointment.appointmentToken,
        reason || 'No reason provided',
        req.user.role === 'patient' ? 'Patient' : 'Doctor'
      );
    } catch (emailError) {
      console.error('Failed to send cancellation emails:', emailError);
    }

    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    console.error('Appointment cancellation error:', error);
    res.status(500).json({ message: 'Server error cancelling appointment' });
  }
});

// Cancel appointment via public link (no auth required)
router.patch('/:appointmentId/cancel-public', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { token, reason } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Appointment token is required' });
    }

    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: User, as: 'patient' },
        { 
          model: Doctor, 
          as: 'doctor',
          include: [{ model: User, as: 'user' }]
        },
        { model: Hospital, as: 'hospital' }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify token
    if (appointment.appointmentToken !== token) {
      return res.status(403).json({ message: 'Invalid appointment token' });
    }

    if (!['pending', 'approved'].includes(appointment.status)) {
      return res.status(400).json({ message: 'This appointment cannot be cancelled' });
    }

    // Check if cancellation is within allowed time (at least 15 minutes before appointment)
    const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    const now = new Date();
    const timeDifference = appointmentDateTime.getTime() - now.getTime();
    const minutesUntilAppointment = timeDifference / (1000 * 60);

    if (minutesUntilAppointment < 15) {
      return res.status(400).json({ 
        message: 'Cannot cancel appointment less than 15 minutes before the scheduled time. Please call the hospital directly.' 
      });
    }

    // Update appointment
    await appointment.update({
      status: 'cancelled',
      notes: reason || 'Cancelled by patient via email link'
    });

    // Send notification emails
    try {
      // Send confirmation to patient
      await emailService.sendCancellationConfirmationToPatient(
        appointment.patient.email,
        appointment.patient.name,
        appointment.doctor.user.name,
        appointment.hospital.name,
        appointment.appointmentDate,
        appointment.appointmentTime,
        appointment.appointmentToken
      );

      // Send notification to doctor
      await emailService.sendCancellationNotificationToDoctor(
        appointment.doctor.user.email,
        appointment.doctor.user.name,
        appointment.patient.name,
        appointment.appointmentDate,
        appointment.appointmentTime,
        appointment.appointmentToken,
        reason || 'No reason provided',
        'Patient (via email)'
      );
    } catch (emailError) {
      console.error('Failed to send cancellation emails:', emailError);
    }

    res.json({
      message: 'Appointment cancelled successfully',
      appointment: {
        id: appointment.id,
        status: appointment.status,
        patientName: appointment.patient.name,
        doctorName: appointment.doctor.user.name,
        hospitalName: appointment.hospital.name,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
      }
    });
  } catch (error) {
    console.error('Cancel appointment via public link error:', error);
    res.status(500).json({ message: 'Server error cancelling appointment' });
  }
});

// Get appointment details
router.get('/:appointmentId', authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: User, as: 'patient', attributes: ['id', 'name', 'email', 'phone'] },
        { 
          model: Doctor, 
          as: 'doctor',
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
            { model: Hospital, as: 'hospital' }
          ]
        },
        { model: Hospital, as: 'hospital' }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user can view this appointment
    const canView = 
      (req.user.role === 'patient' && appointment.patientId === req.user.id) ||
      (req.user.role === 'doctor' && appointment.doctor.userId === req.user.id);

    if (!canView) {
      return res.status(403).json({ message: 'You can only view your own appointments' });
    }

    res.json({ appointment });
  } catch (error) {
    console.error('Fetch appointment error:', error);
    res.status(500).json({ message: 'Server error fetching appointment' });
  }
});

module.exports = router;
