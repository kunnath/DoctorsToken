const User = require('./User');
const Hospital = require('./Hospital');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');

// Define associations
User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctorProfile' });
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Hospital.hasMany(Doctor, { foreignKey: 'hospitalId', as: 'doctors' });
Doctor.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });

User.hasMany(Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

Hospital.hasMany(Appointment, { foreignKey: 'hospitalId', as: 'hospitalAppointments' });
Appointment.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });

module.exports = {
  User,
  Hospital,
  Doctor,
  Appointment,
};
