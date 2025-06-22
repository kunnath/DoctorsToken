const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
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
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  experience: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 70,
    },
  },
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2),
    validate: {
      min: 0,
    },
  },
  availableFrom: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  availableTo: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  workingDays: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  bio: {
    type: DataTypes.TEXT,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

module.exports = Doctor;
