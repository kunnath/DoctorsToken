const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Doctors',
      key: 'id',
    },
  },
  hospitalId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Hospitals',
      key: 'id',
    },
  },
  appointmentToken: {
    type: DataTypes.STRING,
    unique: true,
  },
  appointmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  appointmentTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'approved',
      'rejected',
      'completed',
      'cancelled',
      'cancel_requested'
    ),
    defaultValue: 'pending',
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  doctorNotes: {
    type: DataTypes.TEXT,
  },
  patientLatitude: {
    type: DataTypes.DECIMAL(10, 8),
  },
  patientLongitude: {
    type: DataTypes.DECIMAL(11, 8),
  },
  gpsCheckTime: {
    type: DataTypes.DATE,
  },
  distance: {
    type: DataTypes.DECIMAL(10, 2),
  },
  isGpsVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: (appointment) => {
      if (appointment.status === 'approved' && !appointment.appointmentToken) {
        appointment.appointmentToken = `APT-${uuidv4().substring(0, 8).toUpperCase()}`;
      }
    },
    beforeUpdate: (appointment) => {
      if (appointment.changed('status') && appointment.status === 'approved' && !appointment.appointmentToken) {
        appointment.appointmentToken = `APT-${uuidv4().substring(0, 8).toUpperCase()}`;
      }
    },
  },
});

module.exports = Appointment;
