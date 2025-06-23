import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const CancelAppointment = () => {
  const { appointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [appointment, setAppointment] = useState(null);

  const handleCancel = async () => {
    if (!token) {
      setError('Invalid appointment link');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/cancel-public`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, reason }),
      });

      const data = await response.json();

      if (response.ok) {
        setAppointment(data.appointment);
        setCancelled(true);
        toast.success('Appointment cancelled successfully');
      } else {
        setError(data.message || 'Failed to cancel appointment');
        toast.error(data.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!appointmentId || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center mb-4">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-center text-gray-900 mb-2">
            Invalid Link
          </h1>
          <p className="text-gray-600 text-center">
            The appointment cancellation link is invalid or expired.
          </p>
        </div>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-center text-gray-900 mb-4">
            Appointment Cancelled
          </h1>
          {appointment && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p><strong>Patient:</strong> {appointment.patientName}</p>
              <p><strong>Doctor:</strong> Dr. {appointment.doctorName}</p>
              <p><strong>Hospital:</strong> {appointment.hospitalName}</p>
              <p><strong>Date:</strong> {appointment.appointmentDate}</p>
              <p><strong>Time:</strong> {appointment.appointmentTime}</p>
            </div>
          )}
          <p className="text-gray-600 text-center mb-4">
            Your appointment has been successfully cancelled. Both you and the doctor have been notified via email.
          </p>
          <p className="text-sm text-gray-500 text-center">
            You can book a new appointment anytime through our platform.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center mb-4">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-center text-gray-900 mb-2">
            Cancellation Failed
          </h1>
          <p className="text-red-600 text-center mb-4">
            {error}
          </p>
          <button
            onClick={() => setError('')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-yellow-500" />
        </div>
        <h1 className="text-xl font-bold text-center text-gray-900 mb-4">
          Cancel Appointment
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to cancel your appointment? This action cannot be undone.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for cancellation (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Please let us know why you're cancelling..."
            rows={3}
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Cancelling...
              </>
            ) : (
              'Cancel Appointment'
            )}
          </button>
          <button
            onClick={() => window.close()}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Keep Appointment
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Note: You cannot cancel an appointment less than 15 minutes before the scheduled time.
        </p>
      </div>
    </div>
  );
};

export default CancelAppointment;
