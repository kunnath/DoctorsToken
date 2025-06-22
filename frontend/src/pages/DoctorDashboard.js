import React, { useState, useEffect } from 'react';
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
  Phone,
  Mail,
  Filter,
  Check,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [processingAppointments, setProcessingAppointments] = useState(new Set());

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

  const updateAppointmentStatus = async (appointmentId, status, doctorNotes = '') => {
    try {
      setProcessingAppointments(prev => new Set(prev).add(appointmentId));
      
      await appointmentsAPI.updateStatus(appointmentId, { status, doctorNotes });
      
      const action = status === 'approved' ? 'approved' : 'rejected';
      toast.success(`Appointment ${action} successfully`);
      
      fetchAppointments();
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${status} appointment`;
      toast.error(message);
    } finally {
      setProcessingAppointments(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    }
  };

  const handleApprove = (appointmentId) => {
    updateAppointmentStatus(appointmentId, 'approved');
  };

  const handleReject = (appointmentId) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason !== null) {
      updateAppointmentStatus(appointmentId, 'rejected', reason);
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

  const canProcess = (appointment) => {
    return appointment.status === 'pending';
  };

  const statusOptions = [
    { value: '', label: 'All Appointments' },
    { value: 'pending', label: 'Pending Review' },
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Review and manage patient appointment requests
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => {
                  const today = new Date().toDateString();
                  const appointmentDate = new Date(a.appointmentDate).toDateString();
                  return appointmentDate === today && a.status === 'approved';
                }).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <User className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {pagination.total || 0}
              </p>
            </div>
          </div>
        </div>
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
          <p className="text-gray-600">
            {selectedStatus 
              ? `No appointments with status "${selectedStatus}"`
              : 'No appointments scheduled yet'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {getStatusIcon(appointment.status)}
                  
                  <div className="flex-1">
                    {/* Patient Info */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.patient?.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          {appointment.patient?.email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{appointment.patient.email}</span>
                            </div>
                          )}
                          {appointment.patient?.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{appointment.patient.phone}</span>
                            </div>
                          )}
                        </div>
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

                    {/* Reason */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Reason for visit:</p>
                      <p className="text-sm text-gray-600">{appointment.reason}</p>
                    </div>

                    {/* Patient Notes */}
                    {appointment.notes && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Patient notes:</p>
                        <p className="text-sm text-gray-600">{appointment.notes}</p>
                      </div>
                    )}

                    {/* Doctor Notes */}
                    {appointment.doctorNotes && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Your notes:</p>
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
                            <span className="status-badge status-pending">Pending</span>
                          )}
                          {appointment.distance && (
                            <span className="text-xs text-gray-500">
                              Distance: {appointment.distance}m
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {canProcess(appointment) && (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleApprove(appointment.id)}
                          disabled={processingAppointments.has(appointment.id)}
                          className="btn-success text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          {processingAppointments.has(appointment.id) ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(appointment.id)}
                          disabled={processingAppointments.has(appointment.id)}
                          className="btn-danger text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    )}

                    {/* Appointment created time */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Requested on {format(new Date(appointment.createdAt), 'MMM dd, yyyy \'at\' h:mm a')}
                      </p>
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

export default DoctorDashboard;
