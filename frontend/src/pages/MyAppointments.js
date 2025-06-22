import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsAPI } from '../services/api';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Navigation,
  Phone,
  Mail,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const MyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAppointments();
  }, [selectedStatus, currentPage]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
      };
      
      if (selectedStatus) {
        params.status = selectedStatus;
      }

      const response = await appointmentsAPI.getMyAppointments(params);
      setAppointments(response.data.appointments);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentsAPI.cancel(appointmentId, 'Cancelled by user');
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel appointment';
      toast.error(message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'cancel_requested':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "status-badge";
    switch (status) {
      case 'pending':
        return `${baseClasses} status-pending`;
      case 'approved':
        return `${baseClasses} status-approved`;
      case 'rejected':
        return `${baseClasses} status-rejected`;
      case 'cancelled':
        return `${baseClasses} status-cancelled`;
      case 'completed':
        return `${baseClasses} status-completed`;
      case 'cancel_requested':
        return `${baseClasses} status-cancel-requested`;
      default:
        return `${baseClasses} status-pending`;
    }
  };

  const canCancel = (appointment) => {
    return ['pending', 'approved'].includes(appointment.status);
  };

  const needsGpsVerification = (appointment) => {
    const today = new Date().toDateString();
    const appointmentDate = new Date(appointment.appointmentDate).toDateString();
    return appointment.status === 'approved' && 
           appointmentDate === today && 
           !appointment.isGpsVerified;
  };

  const statusOptions = [
    { value: '', label: 'All Appointments' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'cancel_requested', label: 'Cancel Requested' },
  ];

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-1">
            {user.role === 'patient' 
              ? 'Manage your scheduled appointments'
              : 'View your appointment schedule'
            }
          </p>
        </div>
        {user.role === 'patient' && (
          <Link to="/book-appointment" className="btn-primary">
            Book New Appointment
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="form-input w-auto min-w-[200px]"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            {pagination.total || 0} total appointments
          </span>
        </div>
      </div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <div className="card p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-600 mb-4">
            {selectedStatus 
              ? `No appointments with status "${selectedStatus}"`
              : 'You haven\'t scheduled any appointments yet'
            }
          </p>
          {user.role === 'patient' && !selectedStatus && (
            <Link to="/book-appointment" className="btn-primary">
              Book Your First Appointment
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {getStatusIcon(appointment.status)}
                  
                  <div className="flex-1">
                    {/* Main Info */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.role === 'patient' 
                            ? `Dr. ${appointment.doctor?.user?.name}`
                            : appointment.patient?.name
                          }
                        </h3>
                        <p className="text-gray-600">
                          {appointment.doctor?.specialization}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={getStatusBadge(appointment.status)}>
                          {appointment.status.replace('_', ' ')}
                        </span>
                        {appointment.appointmentToken && (
                          <span className="text-xs font-mono bg-primary-100 text-primary-700 px-2 py-1 rounded">
                            {appointment.appointmentToken}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.appointmentTime}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{appointment.hospital?.name}</span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    {user.role === 'doctor' && appointment.patient && (
                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                        {appointment.patient.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{appointment.patient.email}</span>
                          </div>
                        )}
                        {appointment.patient.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{appointment.patient.phone}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reason */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Reason for visit:</p>
                      <p className="text-sm text-gray-600">{appointment.reason}</p>
                    </div>

                    {/* Notes */}
                    {appointment.notes && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                        <p className="text-sm text-gray-600">{appointment.notes}</p>
                      </div>
                    )}

                    {/* Doctor Notes */}
                    {appointment.doctorNotes && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Doctor's notes:</p>
                        <p className="text-sm text-gray-600">{appointment.doctorNotes}</p>
                      </div>
                    )}

                    {/* GPS Status */}
                    {appointment.status === 'approved' && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">GPS Verification:</p>
                        <div className="flex items-center space-x-2">
                          {appointment.isGpsVerified ? (
                            <span className="status-badge status-approved">Verified</span>
                          ) : (
                            <span className="status-badge status-pending">Not Verified</span>
                          )}
                          {appointment.distance && (
                            <span className="text-xs text-gray-500">
                              Distance: {appointment.distance}m
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      {/* GPS Verification for patients */}
                      {user.role === 'patient' && needsGpsVerification(appointment) && (
                        <Link
                          to={`/gps-verification/${appointment.id}`}
                          className="btn-primary text-sm"
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          Verify Location
                        </Link>
                      )}

                      {/* Cancel Button */}
                      {canCancel(appointment) && (
                        <button
                          onClick={() => cancelAppointment(appointment.id)}
                          className="btn-danger text-sm"
                        >
                          Cancel Appointment
                        </button>
                      )}

                      {/* View Details */}
                      <Link
                        to={`/appointments/${appointment.id}`}
                        className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {pagination.pages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pagination.pages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
