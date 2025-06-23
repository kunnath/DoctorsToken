import React, { useState, useEffect } from 'react';
import { useForm, watch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { doctorsAPI, hospitalsAPI, appointmentsAPI } from '../services/api';
import { Search, MapPin, Clock, User, Calendar, Stethoscope, CheckCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [searchType, setSearchType] = useState('doctor'); // 'doctor' or 'hospital'
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  // Watch form values for preview
  const watchedValues = watch(['appointmentDate', 'appointmentTime', 'reason']);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchDoctorsAndHospitals();
    } else {
      setDoctors([]);
      setHospitals([]);
    }
  }, [searchQuery, searchType]);

  const searchDoctorsAndHospitals = async () => {
    setLoading(true);
    try {
      if (searchType === 'doctor') {
        const response = await doctorsAPI.search({ query: searchQuery });
        // Filter out doctors with incomplete data
        const validDoctors = (response.data.doctors || []).filter(doctor => 
          doctor && doctor.id && doctor.user && doctor.user.name
        );
        setDoctors(validDoctors);
        setHospitals([]);
      } else {
        const response = await hospitalsAPI.search({ query: searchQuery });
        // Filter out hospitals with incomplete data
        const validHospitals = (response.data.hospitals || []).filter(hospital => 
          hospital && hospital.id && hospital.name
        );
        setHospitals(validHospitals);
        setDoctors([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed. Please try again.');
      setDoctors([]);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const selectDoctor = (doctor) => {
    if (!doctor) {
      console.error('Invalid doctor selected');
      toast.error('Invalid doctor selection. Please try again.');
      return;
    }
    
    setSelectedDoctor(doctor);
    setSelectedHospital(doctor.hospital || null);
    const doctorName = doctor?.user?.name || 'Unknown Doctor';
    const hospitalName = doctor?.hospital?.name || 'Unknown Hospital';
    setSearchQuery(`Dr. ${doctorName} - ${hospitalName}`);
    setDoctors([]);
    setHospitals([]);
  };

  const selectHospital = async (hospital) => {
    if (!hospital || !hospital.id) {
      console.error('Invalid hospital selected');
      toast.error('Invalid hospital selection. Please try again.');
      return;
    }

    setSelectedHospital(hospital);
    setSelectedDoctor(null);
    setSearchQuery(hospital.name || 'Unknown Hospital');
    setDoctors([]);
    setHospitals([]);
    
    // Fetch doctors from this hospital
    try {
      const response = await hospitalsAPI.getDoctors(hospital.id);
      // Filter out doctors with incomplete data
      const validDoctors = (response.data.doctors || []).filter(doctor => 
        doctor && doctor.id && doctor.user && doctor.user.name
      );
      setDoctors(validDoctors);
    } catch (error) {
      console.error('Failed to fetch hospital doctors:', error);
      toast.error('Failed to load doctors from this hospital.');
    }
  };

  const onSubmit = async (data) => {
    if (!selectedDoctor || !selectedHospital) {
      toast.error('Please select a doctor and hospital');
      return;
    }

    // Additional validation for doctor and hospital data integrity
    if (!selectedDoctor.id) {
      toast.error('Invalid doctor selection. Please select a doctor again.');
      return;
    }

    if (!selectedHospital.id) {
      toast.error('Invalid hospital selection. Please select a hospital again.');
      return;
    }

    // Validate required fields
    if (!data.appointmentDate) {
      toast.error('Please select an appointment date');
      return;
    }

    if (!data.appointmentTime) {
      toast.error('Please select an appointment time');
      return;
    }

    if (!data.reason || data.reason.trim().length < 10) {
      toast.error('Please provide a reason for your visit (minimum 10 characters)');
      return;
    }

    setBookingLoading(true);
    try {
      const appointmentData = {
        doctorId: selectedDoctor.id,
        hospitalId: selectedHospital.id,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        reason: data.reason.trim(),
        notes: data.notes ? data.notes.trim() : '',
      };

      console.log('Sending appointment data:', appointmentData);

      const response = await appointmentsAPI.create(appointmentData);
      const { appointment } = response.data;
      
      toast.success(
        `Appointment booked successfully! Your token number is: ${appointment.appointmentToken}`,
        { duration: 6000 }
      );
      navigate('/my-appointments');
    } catch (error) {
      console.error('Appointment booking error:', error);
      const message = error.response?.data?.message || 'Failed to book appointment';
      const details = error.response?.data?.details;
      
      if (details && Array.isArray(details)) {
        toast.error(`${message}: ${details.join(', ')}`);
      } else {
        toast.error(message);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedDoctor(null);
    setSelectedHospital(null);
    setSearchQuery('');
    setDoctors([]);
    setHospitals([]);
    reset();
  };

  // Generate time slots with better formatting
  const generateTimeSlots = () => {
    const slots = [];
    
    // Morning slots (9:00 AM - 12:00 PM)
    for (let hour = 9; hour <= 11; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const time12 = format(new Date(`1970-01-01T${time24}`), 'h:mm a');
        slots.push({ value: time24, label: time12, period: 'Morning' });
      }
    }
    
    // Afternoon slots (2:00 PM - 5:00 PM)
    for (let hour = 14; hour <= 16; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const time12 = format(new Date(`1970-01-01T${time24}`), 'h:mm a');
        slots.push({ value: time24, label: time12, period: 'Afternoon' });
      }
    }
    
    // Evening slots (6:00 PM - 8:00 PM)
    for (let hour = 18; hour <= 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const time12 = format(new Date(`1970-01-01T${time24}`), 'h:mm a');
        slots.push({ value: time24, label: time12, period: 'Evening' });
      }
    }
    
    return slots;
  };

  // Generate date constraints (next 30 days, excluding Sundays)
  const getDateConstraints = () => {
    const today = new Date();
    const minDate = format(addDays(today, 1), 'yyyy-MM-dd'); // Tomorrow
    const maxDate = format(addDays(today, 30), 'yyyy-MM-dd'); // 30 days from now
    return { minDate, maxDate };
  };

  // Check if a date is a Sunday
  const isSunday = (dateString) => {
    const date = new Date(dateString);
    return date.getDay() === 0;
  };

  // Validate selected date
  const validateDate = (dateString) => {
    if (!dateString) return false;
    
    const selectedDate = new Date(dateString);
    const today = new Date();
    const maxDate = addDays(today, 30);
    
    // Check if date is in valid range
    if (selectedDate <= today || selectedDate > maxDate) {
      return false;
    }
    
    // Check if it's not a Sunday
    if (selectedDate.getDay() === 0) {
      return false;
    }
    
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
        <p className="text-gray-600">
          Search for doctors or hospitals and schedule your appointment
        </p>
      </div>

      {/* Search Section */}
      <div className="card p-6">
        <div className="space-y-4">
          {/* Search Type Toggle */}
          <div className="flex space-x-4">
            <button
              onClick={() => setSearchType('doctor')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchType === 'doctor'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Search by Doctor
            </button>
            <button
              onClick={() => setSearchType('hospital')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchType === 'hospital'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Search by Hospital
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchType === 'doctor'
                  ? 'Search for doctors by name...'
                  : 'Search for hospitals by name...'
              }
              className="form-input pl-10"
            />
            {(selectedDoctor || selectedHospital) && (
              <button
                onClick={clearSelection}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Search Results */}
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          )}

          {/* Doctors Results */}
          {doctors.length > 0 && !selectedDoctor && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <h3 className="font-medium text-gray-900">Available Doctors</h3>
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => selectDoctor(doctor)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <Stethoscope className="h-5 w-5 text-primary-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        Dr. {doctor?.user?.name || 'Unknown Doctor'}
                      </h4>
                      <p className="text-sm text-gray-600">{doctor?.specialization || 'Specialization not specified'}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{doctor?.hospital?.name || 'Hospital not specified'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{doctor.availableFrom} - {doctor.availableTo}</span>
                        </span>
                        {doctor.consultationFee && (
                          <span>${doctor.consultationFee}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Hospitals Results */}
          {hospitals.length > 0 && !selectedHospital && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <h3 className="font-medium text-gray-900">Available Hospitals</h3>
              {hospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  onClick={() => selectHospital(hospital)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-primary-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{hospital.name}</h4>
                      <p className="text-sm text-gray-600">{hospital.address}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {hospital.doctors?.length || 0} doctors available
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Doctor Display */}
          {selectedDoctor && selectedHospital && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h3 className="font-medium text-primary-900 mb-2">Selected Doctor</h3>
              <div className="flex items-center space-x-3">
                <Stethoscope className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="font-medium text-primary-900">
                    Dr. {selectedDoctor?.user?.name || 'Unknown Doctor'}
                  </p>
                  <p className="text-sm text-primary-700">
                    {selectedDoctor?.specialization || 'Specialization not specified'}
                  </p>
                  <p className="text-sm text-primary-600">
                    {selectedHospital?.name || 'Hospital not specified'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Form */}
      {selectedDoctor && selectedHospital && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Appointment Details</h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div>
                <label className="form-label">Appointment Date</label>
                <input
                  type="date"
                  {...register('appointmentDate', { 
                    required: 'Please select a date',
                    validate: {
                      notSunday: (value) => !isSunday(value) || 'Appointments are not available on Sundays',
                      futureDate: (value) => validateDate(value) || 'Please select a valid future date (within 30 days)',
                    }
                  })}
                  min={getDateConstraints().minDate}
                  max={getDateConstraints().maxDate}
                  className={`form-input ${errors.appointmentDate ? 'border-red-300' : ''}`}
                />
                {errors.appointmentDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.appointmentDate.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Available dates: Tomorrow to {format(addDays(new Date(), 30), 'MMM dd, yyyy')} (excluding Sundays)
                </p>
              </div>

              {/* Time Selection */}
              <div>
                <label className="form-label">Appointment Time</label>
                <select
                  {...register('appointmentTime', { required: 'Please select a time' })}
                  className={`form-input ${errors.appointmentTime ? 'border-red-300' : ''}`}
                >
                  <option value="">Select a time</option>
                  {generateTimeSlots().reduce((acc, slot, index, array) => {
                    // Add period headers
                    if (index === 0 || slot.period !== array[index - 1].period) {
                      acc.push(
                        <optgroup key={slot.period} label={`${slot.period} Hours`}>
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        </optgroup>
                      );
                    } else {
                      // Find the current optgroup and add to it
                      const currentGroup = acc[acc.length - 1];
                      acc[acc.length - 1] = React.cloneElement(currentGroup, {
                        children: [
                          ...React.Children.toArray(currentGroup.props.children),
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ]
                      });
                    }
                    return acc;
                  }, [])}
                </select>
                {errors.appointmentTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.appointmentTime.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Available hours: Morning (9 AM - 12 PM), Afternoon (2 PM - 5 PM), Evening (6 PM - 8 PM)
                </p>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="form-label">Reason for Visit</label>
              <textarea
                {...register('reason', {
                  required: 'Please provide a reason for your visit',
                  minLength: {
                    value: 10,
                    message: 'Please provide at least 10 characters',
                  },
                })}
                rows={3}
                className={`form-input ${errors.reason ? 'border-red-300' : ''}`}
                placeholder="Describe your symptoms or reason for the appointment..."
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="form-label">Additional Notes (Optional)</label>
              <textarea
                {...register('notes')}
                rows={2}
                className="form-input"
                placeholder="Any additional information you'd like to share..."
              />
            </div>

            {/* Appointment Preview */}
            {watchedValues[0] && watchedValues[1] && watchedValues[2] && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Appointment Summary</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800">
                      <strong>Doctor:</strong> Dr. {selectedDoctor?.user?.name || 'Unknown Doctor'} ({selectedDoctor?.specialization || 'Specialization not specified'})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800">
                      <strong>Hospital:</strong> {selectedHospital?.name || 'Hospital not specified'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800">
                      <strong>Date:</strong> {format(new Date(watchedValues[0]), 'EEEE, MMMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800">
                      <strong>Time:</strong> {format(new Date(`1970-01-01T${watchedValues[1]}`), 'h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <User className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span className="text-blue-800">
                      <strong>Reason:</strong> {watchedValues[2]}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={bookingLoading}
                className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Booking Appointment...
                  </div>
                ) : (
                  'Book Appointment'
                )}
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="px-6 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
