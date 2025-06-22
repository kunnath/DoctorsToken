const Joi = require('joi');

const registerValidation = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('patient', 'doctor').default('patient'),
  phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).optional(),
});

const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const appointmentValidation = Joi.object({
  doctorId: Joi.string().uuid().required(),
  hospitalId: Joi.string().uuid().required(),
  appointmentDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().custom((value, helpers) => {
    const date = new Date(value + 'T00:00:00.000Z'); // Ensure consistent date parsing
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(date.getTime())) {
      return helpers.error('any.invalid', { message: 'Invalid date format' });
    }
    
    if (date < today) {
      return helpers.error('any.invalid', { message: 'Appointment date cannot be in the past' });
    }
    
    // Check if it's a Sunday (0 = Sunday)
    if (date.getDay() === 0) {
      return helpers.error('any.invalid', { message: 'Appointments are not available on Sundays' });
    }
    
    return value;
  }),
  appointmentTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  reason: Joi.string().min(10).max(500).required(),
  notes: Joi.string().max(1000).optional().allow(''),
});

const gpsValidation = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

const doctorProfileValidation = Joi.object({
  hospitalId: Joi.string().uuid().required(),
  specialization: Joi.string().required(),
  licenseNumber: Joi.string().required(),
  experience: Joi.number().min(0).max(70).optional(),
  consultationFee: Joi.number().min(0).optional(),
  availableFrom: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  availableTo: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  workingDays: Joi.array().items(Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')).optional(),
  bio: Joi.string().max(1000).optional(),
});

const validate = (schema) => {
  return (req, res, next) => {
    console.log('Validation input:', JSON.stringify(req.body, null, 2));
    const { error } = schema.validate(req.body);
    if (error) {
      console.log('Validation error details:', error.details);
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message),
      });
    }
    console.log('Validation passed');
    next();
  };
};

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  appointmentValidation,
  gpsValidation,
  doctorProfileValidation,
};
