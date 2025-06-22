import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentsAPI, gpsAPI } from '../services/api';
import { 
  Navigation, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const GPSVerification = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [gpsStatus, setGpsStatus] = useState(null);

  useEffect(() => {
    fetchAppointmentDetails();
    fetchGpsStatus();
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      const response = await appointmentsAPI.getById(appointmentId);
      setAppointment(response.data.appointment);
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
      toast.error('Failed to load appointment details');
      navigate('/my-appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchGpsStatus = async () => {
    try {
      const response = await gpsAPI.getStatus(appointmentId);
      setGpsStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch GPS status:', error);
    }
  };

  const getCurrentLocation = () => {
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setCurrentLocation(location);
        toast.success('Location detected successfully');
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while retrieving location.';
            break;
        }
        setLocationError(errorMessage);
        toast.error(errorMessage);
      },
      options
    );
  };

  const verifyLocation = async () => {
    if (!currentLocation) {
      toast.error('Please get your current location first');
      return;
    }

    setVerifying(true);
    try {
      const response = await gpsAPI.verify(appointmentId, {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      });

      if (response.data.isVerified) {
        toast.success('GPS verification successful! You are within the required distance.');
        navigate('/my-appointments');
      } else {
        toast.error('GPS verification failed. You are too far from the hospital.');
        // Refresh GPS status to show updated information
        fetchGpsStatus();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'GPS verification failed';
      toast.error(message);
      
      // If the appointment was cancelled due to distance, refresh the appointment details
      if (error.response?.data?.status === 'cancel_requested') {
        fetchAppointmentDetails();
        fetchGpsStatus();
      }
    } finally {
      setVerifying(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Appointment not found</h3>
        <button
          onClick={() => navigate('/my-appointments')}
          className="btn-primary"
        >
          Back to Appointments
        </button>
      </div>
    );
  }

  const today = new Date().toDateString();
  const appointmentDate = new Date(appointment.appointmentDate).toDateString();
  const isToday = appointmentDate === today;
  const isApproved = appointment.status === 'approved';

  if (!isToday) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <Calendar className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">GPS verification not available</h3>
          <p className="text-gray-600 mb-4">
            GPS verification is only available on the day of your appointment.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Your appointment is scheduled for {format(new Date(appointment.appointmentDate), 'EEEE, MMM dd, yyyy')}
          </p>
          <button
            onClick={() => navigate('/my-appointments')}
            className="btn-primary"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Appointment not approved</h3>
          <p className="text-gray-600 mb-4">
            GPS verification is only available for approved appointments.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Current status: <span className="font-medium capitalize">{appointment.status}</span>
          </p>
          <button
            onClick={() => navigate('/my-appointments')}
            className="btn-primary"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  const estimatedDistance = currentLocation && gpsStatus?.hospitalLocation
    ? calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        parseFloat(gpsStatus.hospitalLocation.latitude),
        parseFloat(gpsStatus.hospitalLocation.longitude)
      )
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">GPS Verification</h1>
        <p className="text-gray-600">
          Verify your location to confirm your appointment attendance
        </p>
      </div>

      {/* Appointment Details */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-400" />
            <span>Dr. {appointment.doctor?.user?.name}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span>{format(new Date(appointment.appointmentDate), 'EEEE, MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-gray-400" />
            <span>{appointment.appointmentTime}</span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <span>{appointment.hospital?.name}</span>
          </div>
          {appointment.appointmentToken && (
            <div className="mt-4 p-3 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-700">
                <strong>Appointment Token:</strong> {appointment.appointmentToken}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* GPS Verification Status */}
      {gpsStatus && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">GPS Verified:</span>
              <div className="flex items-center space-x-2">
                {gpsStatus.isGpsVerified ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-600 font-medium">Verified</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-600 font-medium">Not Verified</span>
                  </>
                )}
              </div>
            </div>
            {gpsStatus.gpsCheckTime && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Check:</span>
                <span className="text-gray-900">
                  {format(new Date(gpsStatus.gpsCheckTime), 'h:mm a')}
                </span>
              </div>
            )}
            {gpsStatus.distance && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Distance:</span>
                <span className="text-gray-900">{gpsStatus.distance}m</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Required Distance:</span>
              <span className="text-gray-900">Within {gpsStatus.maxDistance}m</span>
            </div>
          </div>
        </div>
      )}

      {/* Current Location */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Current Location</h3>
        
        {!currentLocation ? (
          <div className="text-center py-6">
            <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              We need to access your location to verify you're at the hospital.
            </p>
            <button
              onClick={getCurrentLocation}
              className="btn-primary"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get My Location
            </button>
            {locationError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{locationError}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Location detected</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Latitude: {currentLocation.latitude.toFixed(6)}</p>
              <p>Longitude: {currentLocation.longitude.toFixed(6)}</p>
              <p>Accuracy: ±{Math.round(currentLocation.accuracy)}m</p>
            </div>
            
            {estimatedDistance && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Estimated distance to hospital:</strong> {Math.round(estimatedDistance)}m
                </p>
                {estimatedDistance <= (gpsStatus?.maxDistance || 500) ? (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ You appear to be within the required distance
                  </p>
                ) : (
                  <p className="text-sm text-red-600 mt-1">
                    ⚠ You may be too far from the hospital
                  </p>
                )}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={verifyLocation}
                disabled={verifying || gpsStatus?.isGpsVerified}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? (
                  <div className="flex items-center justify-center">
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </div>
                ) : gpsStatus?.isGpsVerified ? (
                  'Already Verified'
                ) : (
                  'Verify My Location'
                )}
              </button>
              <button
                onClick={getCurrentLocation}
                className="btn-secondary"
              >
                Refresh Location
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="card p-6 bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Important Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• You must be within 500 meters of the hospital to verify your location</li>
          <li>• GPS verification is required on the day of your appointment</li>
          <li>• If you're too far away, your appointment may be automatically cancelled</li>
          <li>• Make sure your device's location services are enabled</li>
          <li>• For best accuracy, verify your location when you arrive at the hospital</li>
        </ul>
      </div>

      {/* Back Button */}
      <div className="text-center">
        <button
          onClick={() => navigate('/my-appointments')}
          className="btn-secondary"
        >
          Back to My Appointments
        </button>
      </div>
    </div>
  );
};

export default GPSVerification;
