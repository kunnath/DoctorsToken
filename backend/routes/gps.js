const express = require('express');
const { getDistance } = require('geolib');
const { Appointment, Hospital, Doctor, User } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { validate, gpsValidation } = require('../middleware/validation');
const emailService = require('../services/emailService');

const router = express.Router();

// Verify GPS location for appointment
router.post('/verify/:appointmentId', 
  authMiddleware, 
  roleMiddleware(['patient']), 
  validate(gpsValidation), 
  async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const { latitude, longitude } = req.body;

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

      // Check if user owns this appointment
      if (appointment.patientId !== req.user.id) {
        return res.status(403).json({ message: 'You can only verify GPS for your own appointments' });
      }

      // Check if appointment is approved
      if (appointment.status !== 'approved') {
        return res.status(400).json({ message: 'Only approved appointments can be GPS verified' });
      }

      // Check if appointment is for today
      const today = new Date().toDateString();
      const appointmentDate = new Date(appointment.appointmentDate).toDateString();
      
      if (appointmentDate !== today) {
        return res.status(400).json({ message: 'GPS verification is only allowed on the appointment day' });
      }

      // Calculate distance
      const hospitalLocation = {
        latitude: parseFloat(appointment.hospital.latitude),
        longitude: parseFloat(appointment.hospital.longitude)
      };

      const patientLocation = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      };

      const distance = getDistance(patientLocation, hospitalLocation);
      const maxDistance = parseInt(process.env.MAX_DISTANCE_METERS) || 500;

      // Update appointment with GPS data
      await appointment.update({
        patientLatitude: latitude,
        patientLongitude: longitude,
        gpsCheckTime: new Date(),
        distance,
        isGpsVerified: distance <= maxDistance
      });

      if (distance > maxDistance) {
        // Mark appointment as cancel requested
        await appointment.update({
          status: 'cancel_requested'
        });

        // Send cancellation emails
        await emailService.sendGpsCancellationEmail(
          appointment.patient.email,
          appointment.patient.name,
          appointment.doctor.user.name,
          appointment.hospital.name,
          appointment.appointmentDate,
          appointment.appointmentTime,
          distance,
          maxDistance
        );

        await emailService.sendGpsCancellationEmailToDoctor(
          appointment.doctor.user.email,
          appointment.doctor.user.name,
          appointment.patient.name,
          appointment.appointmentDate,
          appointment.appointmentTime,
          distance,
          maxDistance
        );

        return res.status(400).json({
          message: 'GPS verification failed. You are too far from the hospital.',
          distance,
          maxDistance,
          status: 'cancel_requested'
        });
      }

      res.json({
        message: 'GPS verification successful',
        distance,
        maxDistance,
        isVerified: true
      });
    } catch (error) {
      console.error('GPS verification error:', error);
      res.status(500).json({ message: 'Server error during GPS verification' });
    }
  }
);

// Get GPS status for appointment
router.get('/status/:appointmentId', authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: Hospital, as: 'hospital', attributes: ['latitude', 'longitude', 'name'] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user can view this appointment
    const canView = 
      (req.user.role === 'patient' && appointment.patientId === req.user.id) ||
      (req.user.role === 'doctor' && appointment.doctor?.userId === req.user.id);

    if (!canView) {
      return res.status(403).json({ message: 'You can only view GPS status for your own appointments' });
    }

    res.json({
      appointmentId: appointment.id,
      isGpsVerified: appointment.isGpsVerified,
      gpsCheckTime: appointment.gpsCheckTime,
      distance: appointment.distance,
      patientLocation: appointment.patientLatitude && appointment.patientLongitude ? {
        latitude: appointment.patientLatitude,
        longitude: appointment.patientLongitude
      } : null,
      hospitalLocation: {
        latitude: appointment.hospital.latitude,
        longitude: appointment.hospital.longitude,
        name: appointment.hospital.name
      },
      maxDistance: parseInt(process.env.MAX_DISTANCE_METERS) || 500
    });
  } catch (error) {
    console.error('GPS status fetch error:', error);
    res.status(500).json({ message: 'Server error fetching GPS status' });
  }
});

module.exports = router;
