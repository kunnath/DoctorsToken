import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  UserCheck, 
  Stethoscope, 
  Building2, 
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Admin access required');
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${color}`}>
          <Icon className="h-8 w-8" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {change && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change > 0 ? '+' : ''}{change}
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'rejected':
      case 'cancelled':
        return XCircle;
      default:
        return Timer;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor and manage your healthcare platform
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: Activity },
              { id: 'users', name: 'Users', icon: Users },
              { id: 'analytics', name: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && dashboardData && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <StatCard
                title="Total Users"
                value={dashboardData.totals.users}
                icon={Users}
                color="text-blue-600"
                change={dashboardData.growth.newUsersThisMonth}
              />
              <StatCard
                title="Patients"
                value={dashboardData.totals.patients}
                icon={UserCheck}
                color="text-green-600"
                change={dashboardData.growth.newPatientsThisMonth}
              />
              <StatCard
                title="Doctors"
                value={dashboardData.totals.doctors}
                icon={Stethoscope}
                color="text-purple-600"
                change={dashboardData.growth.newDoctorsThisMonth}
              />
              <StatCard
                title="Hospitals"
                value={dashboardData.totals.hospitals}
                icon={Building2}
                color="text-orange-600"
              />
              <StatCard
                title="Appointments"
                value={dashboardData.totals.appointments}
                icon={Calendar}
                color="text-red-600"
                change={dashboardData.growth.recentAppointments}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Appointment Status Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Appointments by Status
                </h3>
                <div className="space-y-4">
                  {Object.entries(dashboardData.appointmentsByStatus || {}).map(([status, count]) => {
                    const Icon = getStatusIcon(status);
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Icon className={`h-5 w-5 mr-3 ${getStatusColor(status)}`} />
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {status}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Trends */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Monthly Appointment Trends
                </h3>
                <div className="space-y-3">
                  {dashboardData.monthlyAppointments?.map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{month.month}</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ 
                              width: `${Math.max((month.count / Math.max(...dashboardData.monthlyAppointments.map(m => m.count))) * 100, 5)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{month.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Doctors */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Top Performing Doctors
                </h3>
                <div className="space-y-4">
                  {dashboardData.topDoctors?.map((doctor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          Dr. {doctor.doctorName}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {doctor.appointmentCount} appointments
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hospital Utilization */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Hospital Utilization
                </h3>
                <div className="space-y-4">
                  {dashboardData.hospitalStats?.map((hospital, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-orange-500 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          {hospital.hospitalName}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {hospital.appointmentCount} appointments
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">User Management</h3>
              <p className="text-sm text-gray-600">View and manage all users in the system</p>
            </div>
            <div className="p-6">
              <p className="text-gray-600">User management interface will be implemented here...</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Advanced Analytics</h3>
              <p className="text-sm text-gray-600">Detailed insights and trends</p>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Advanced analytics will be implemented here...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
