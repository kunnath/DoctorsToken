const cron = require('node-cron');
const { Op } = require('sequelize');
const { Appointment, User, Doctor, Hospital } = require('../models');
const emailService = require('./emailService');

console.log('Scheduler initialized');

// Run every hour to check appointments that need GPS verification reminders
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Running GPS verification reminder check...');
    
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    // Find approved appointments happening in the next hour that haven't been GPS verified
    const upcomingAppointments = await Appointment.findAll({
      where: {
        status: 'approved',
        appointmentDate: now.toDateString(),
        isGpsVerified: false,
        gpsCheckTime: null
      },
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

    for (const appointment of upcomingAppointments) {
      const appointmentDateTime = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
      
      // If appointment is within 1 hour, send reminder
      if (appointmentDateTime <= oneHourFromNow && appointmentDateTime > now) {
        // Send GPS verification reminder
        console.log(`Sending GPS reminder for appointment ${appointment.id}`);
        // You can implement a reminder email here if needed
      }
    }
  } catch (error) {
    console.error('GPS reminder scheduler error:', error);
  }
});

// Run every 15 minutes to auto-cancel appointments that haven't been GPS verified
cron.schedule('*/15 * * * *', async () => {
  try {
    console.log('Running auto-cancellation check...');
    
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    
    // Find approved appointments that have passed their time by 15 minutes without GPS verification
    const overdueAppointments = await Appointment.findAll({
      where: {
        status: 'approved',
        appointmentDate: now.toDateString(),
        isGpsVerified: false
      },
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

    for (const appointment of overdueAppointments) {
      const appointmentDateTime = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
      
      // If appointment time has passed by 15 minutes without GPS verification
      if (appointmentDateTime <= fifteenMinutesAgo) {
        console.log(`Auto-cancelling overdue appointment ${appointment.id}`);
        
        await appointment.update({
          status: 'cancelled',
          notes: 'Automatically cancelled - GPS verification not completed within time limit'
        });

        // Send cancellation emails
        try {
          await emailService.sendGpsCancellationEmail(
            appointment.patient.email,
            appointment.patient.name,
            appointment.doctor.user.name,
            appointment.hospital.name,
            appointment.appointmentDate,
            appointment.appointmentTime,
            'N/A',
            process.env.MAX_DISTANCE_METERS || 500
          );

          await emailService.sendGpsCancellationEmailToDoctor(
            appointment.doctor.user.email,
            appointment.doctor.user.name,
            appointment.patient.name,
            appointment.appointmentDate,
            appointment.appointmentTime,
            'N/A',
            process.env.MAX_DISTANCE_METERS || 500
          );
        } catch (emailError) {
          console.error('Failed to send auto-cancellation emails:', emailError);
        }
      }
    }
  } catch (error) {
    console.error('Auto-cancellation scheduler error:', error);
  }
});

// Run daily at midnight to clean up old appointments
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Running daily cleanup...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Archive or clean up old appointments (optional)
    // You can implement cleanup logic here if needed
    
    console.log('Daily cleanup completed');
  } catch (error) {
    console.error('Daily cleanup scheduler error:', error);
  }
});

module.exports = {};
