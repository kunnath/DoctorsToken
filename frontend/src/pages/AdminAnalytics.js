import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  Calendar, 
  Clock,
  Users,
  Activity,
  BarChart3,
  PieChart,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
  UserPlus,
  FileText,
  Heart,
  Building2,
  Stethoscope
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';

const AdminAnalytics = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [activeChart, setActiveChart] = useState('registrations');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAnalytics();
      fetchDashboardData();
    }
  }, [user, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnalytics({ period });
      if (response.data.success) {
        setAnalyticsData(response.data.data);
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    }
  };

  const exportData = () => {
    if (!analyticsData || !dashboardData) {
      toast.error('No data available to export');
      return;
    }

    // Create comprehensive CSV data
    const csvData = [
      ['Analytics Report', `Period: ${periodOptions.find(p => p.value === period)?.label}`],
      ['Generated on', new Date().toLocaleDateString()],
      [''],
      ['SUMMARY STATISTICS'],
      ['Total Users', dashboardData?.totals?.users || 0],
      ['Total Patients', dashboardData?.totals?.patients || 0],
      ['Total Doctors', dashboardData?.totals?.doctors || 0],
      ['Total Hospitals', dashboardData?.totals?.hospitals || 0],
      ['Total Appointments', dashboardData?.totals?.appointments || 0],
      [''],
      ['GROWTH METRICS'],
      ['New Users This Month', dashboardData?.growth?.newUsersThisMonth || 0],
      ['New Patients This Month', dashboardData?.growth?.newPatientsThisMonth || 0],
      ['New Doctors This Month', dashboardData?.growth?.newDoctorsThisMonth || 0],
      ['Recent Appointments', dashboardData?.growth?.recentAppointments || 0],
      [''],
      ['APPOINTMENT STATUS BREAKDOWN'],
      ...Object.entries(dashboardData?.appointmentsByStatus || {}).map(([status, count]) => [
        status.charAt(0).toUpperCase() + status.slice(1), count
      ]),
      [''],
      ['TOP PERFORMING DOCTORS'],
      ['Doctor Name', 'Appointment Count'],
      ...(dashboardData?.topDoctors || []).map(doctor => [
        `Dr. ${doctor?.doctorName || 'Unknown'}`, doctor?.appointmentCount || 0
      ]),
      [''],
      ['PEAK HOURS ANALYSIS'],
      ['Time', 'Appointment Count'],
      ...(analyticsData?.peakHours || []).map(hour => [
        hour?.time || 'Unknown', hour?.count || 0
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healthcare_analytics_${period}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Analytics data exported successfully!');
  };

  const calculateGrowthPercentage = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const getGrowthIcon = (percentage) => {
    if (percentage > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (percentage < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getGrowthColor = (percentage) => {
    if (percentage > 0) return 'text-green-600';
    if (percentage < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const periodOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required to access analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4">
            {/* Title and Description */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Advanced Analytics</h1>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="ml-2 text-xs text-green-600 font-medium">Live</span>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-600">
                  Comprehensive insights and performance metrics for your healthcare platform
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Last updated: {new Date().toLocaleString()}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center">
                    <Activity className="w-3 h-3 mr-1" />
                    Auto-refresh enabled
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:min-w-0">
                {/* Period Selector */}
                <div className="relative">
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="appearance-none border border-gray-300 rounded-md px-3 py-2 pr-8 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                  >
                    {periodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Export Button */}
                <button
                  onClick={exportData}
                  disabled={loading || (!analyticsData && !dashboardData)}
                  className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export Data</span>
                  <span className="sm:hidden">Export</span>
                </button>

                {/* Refresh Button */}
                <button
                  onClick={() => {
                    fetchAnalytics();
                    fetchDashboardData();
                    toast.success('Data refreshed!');
                  }}
                  disabled={loading}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm font-medium transition-all shadow-sm hover:shadow-md"
                >
                  <Activity className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="ml-2 hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Bar */}
            {dashboardData && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold text-blue-600">
                      {formatNumber(dashboardData?.totals?.users || 0)}
                    </div>
                    <div className="text-xs text-gray-600">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold text-green-600">
                      {formatNumber(dashboardData?.totals?.appointments || 0)}
                    </div>
                    <div className="text-xs text-gray-600">Appointments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold text-purple-600">
                      {formatNumber(dashboardData?.totals?.doctors || 0)}
                    </div>
                    <div className="text-xs text-gray-600">Doctors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold text-orange-600">
                      {dashboardData ? Math.round(
                        ((dashboardData?.appointmentsByStatus?.completed || 0) + 
                         (dashboardData?.appointmentsByStatus?.approved || 0)) / 
                        Math.max(dashboardData?.totals?.appointments || 1, 1) * 100
                      ) : 0}%
                    </div>
                    <div className="text-xs text-gray-600">Success Rate</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Key Performance Indicators */}
            {dashboardData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total Platform Users</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {formatNumber(dashboardData?.totals?.users || 0)}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center">
                    {getGrowthIcon(dashboardData?.growth?.newUsersThisMonth || 0)}
                    <span className={`ml-1 text-xs sm:text-sm font-medium ${getGrowthColor(dashboardData?.growth?.newUsersThisMonth || 0)}`}>
                      {dashboardData?.growth?.newUsersThisMonth || 0} new this month
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Active Doctors</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {formatNumber(dashboardData?.totals?.doctors || 0)}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                      <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center">
                    {getGrowthIcon(dashboardData?.growth?.newDoctorsThisMonth || 0)}
                    <span className={`ml-1 text-xs sm:text-sm font-medium ${getGrowthColor(dashboardData?.growth?.newDoctorsThisMonth || 0)}`}>
                      {dashboardData?.growth?.newDoctorsThisMonth || 0} new this month
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total Appointments</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {formatNumber(dashboardData?.totals?.appointments || 0)}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center">
                    {getGrowthIcon(dashboardData?.growth?.recentAppointments || 0)}
                    <span className={`ml-1 text-xs sm:text-sm font-medium ${getGrowthColor(dashboardData?.growth?.recentAppointments || 0)}`}>
                      {dashboardData?.growth?.recentAppointments || 0} recent bookings
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Hospital Partners</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {formatNumber(dashboardData?.totals?.hospitals || 0)}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
                      <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center">
                    <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    <span className="ml-1 text-xs sm:text-sm font-medium text-gray-600">
                      Network expansion
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Chart Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 sm:mb-8 overflow-hidden">
              <div className="border-b border-gray-200">
                {/* Desktop Navigation */}
                <nav className="hidden sm:flex -mb-px">
                  {[
                    { id: 'registrations', name: 'User Growth', icon: UserPlus, color: 'text-green-600', description: 'Track new user registrations' },
                    { id: 'appointments', name: 'Appointments', icon: Calendar, color: 'text-blue-600', description: 'Monitor booking patterns' },
                    { id: 'performance', name: 'Performance', icon: TrendingUp, color: 'text-purple-600', description: 'Analyze key metrics' },
                    { id: 'hours', name: 'Peak Hours', icon: Clock, color: 'text-orange-600', description: 'Identify busy periods' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveChart(tab.id)}
                      className={`group inline-flex items-center py-4 px-6 border-b-2 font-medium text-sm transition-all ${
                        activeChart === tab.id
                          ? `border-blue-500 ${tab.color} bg-blue-50`
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className={`w-5 h-5 mr-2 ${activeChart === tab.id ? tab.color : 'text-gray-400'}`} />
                      <div className="text-left">
                        <div>{tab.name}</div>
                        <div className="text-xs text-gray-400 font-normal">{tab.description}</div>
                      </div>
                    </button>
                  ))}
                </nav>

                {/* Mobile Navigation */}
                <div className="sm:hidden p-2">
                  <select
                    value={activeChart}
                    onChange={(e) => setActiveChart(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {[
                      { id: 'registrations', name: 'User Growth 📈' },
                      { id: 'appointments', name: 'Appointments 📅' },
                      { id: 'performance', name: 'Performance 🎯' },
                      { id: 'hours', name: 'Peak Hours ⏰' }
                    ].map((tab) => (
                      <option key={tab.id} value={tab.id}>
                        {tab.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Active tab indicator for mobile */}
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <div className="flex items-center">
                      {(() => {
                        const currentTab = [
                          { id: 'registrations', name: 'User Growth', icon: UserPlus, description: 'Track new user registrations' },
                          { id: 'appointments', name: 'Appointments', icon: Calendar, description: 'Monitor booking patterns' },
                          { id: 'performance', name: 'Performance', icon: TrendingUp, description: 'Analyze key metrics' },
                          { id: 'hours', name: 'Peak Hours', icon: Clock, description: 'Identify busy periods' }
                        ].find(tab => tab.id === activeChart);
                        
                        return currentTab ? (
                          <>
                            <currentTab.icon className="w-4 h-4 mr-2 text-blue-600" />
                            <div>
                              <div className="text-sm font-medium text-blue-900">{currentTab.name}</div>
                              <div className="text-xs text-blue-600">{currentTab.description}</div>
                            </div>
                          </>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {/* User Registration Trends */}
                {activeChart === 'registrations' && (
                  <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">User Registration Trends</h3>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {periodOptions.find(p => p.value === period)?.label}
                      </span>
                    </div>
                    
                    {analyticsData?.userRegistrations && analyticsData.userRegistrations.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                          {['patient', 'doctor', 'admin'].map(role => {
                            const roleData = analyticsData.userRegistrations.filter(ur => ur.role === role);
                            const totalCount = roleData.reduce((sum, item) => {
                              const count = item?.dataValues?.count || item?.count || 0;
                              return sum + parseInt(count);
                            }, 0);
                            
                            const roleColors = {
                              patient: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', dot: 'bg-green-500' },
                              doctor: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', dot: 'bg-blue-500' },
                              admin: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', dot: 'bg-purple-500' }
                            };

                            return (
                              <div key={role} className={`${roleColors[role].bg} ${roleColors[role].border} border rounded-lg p-3 text-center`}>
                                <div className={`w-3 h-3 ${roleColors[role].dot} rounded-full mx-auto mb-2`}></div>
                                <p className="text-xs font-medium text-gray-600 capitalize">{role}s</p>
                                <p className={`text-lg font-bold ${roleColors[role].text}`}>{totalCount}</p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Detailed Charts */}
                        {['patient', 'doctor', 'admin'].map(role => {
                          const roleData = analyticsData.userRegistrations.filter(ur => ur.role === role);
                          if (roleData.length === 0) return null;

                          const totalCount = roleData.reduce((sum, item) => {
                            const count = item?.dataValues?.count || item?.count || 0;
                            return sum + parseInt(count);
                          }, 0);
                          const maxCount = Math.max(...roleData.map(item => {
                            const count = item?.dataValues?.count || item?.count || 0;
                            return parseInt(count);
                          }), 1);

                          const roleColors = {
                            patient: 'bg-green-500',
                            doctor: 'bg-blue-500',
                            admin: 'bg-purple-500'
                          };

                          const roleBgColors = {
                            patient: 'bg-green-50 border-green-200',
                            doctor: 'bg-blue-50 border-blue-200',
                            admin: 'bg-purple-50 border-purple-200'
                          };

                          return (
                            <div key={role} className={`border rounded-lg p-3 sm:p-4 ${roleBgColors[role]} transition-all hover:shadow-md`}>
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-4">
                                <h4 className="text-sm sm:text-base font-medium text-gray-900 capitalize flex items-center">
                                  <div className={`w-3 h-3 rounded-full mr-2 ${roleColors[role]}`}></div>
                                  {role} Registrations
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs sm:text-sm font-semibold text-gray-700 bg-white px-2 py-1 rounded">
                                    Total: {totalCount}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Avg: {Math.round(totalCount / Math.max(roleData.length, 1))}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2 sm:space-y-3">
                                {roleData.map((item, index) => {
                                  const count = parseInt(item?.dataValues?.count || item?.count || 0);
                                  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                                  const date = new Date(item?.dataValues?.date || item?.date || new Date());
                                  const isRecent = Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000; // Last 7 days
                                  
                                  return (
                                    <div key={index} className={`flex items-center gap-3 sm:gap-4 ${isRecent ? 'bg-white rounded-md p-2' : ''}`}>
                                      <div className="w-16 sm:w-20 text-xs sm:text-sm text-gray-600 font-medium">
                                        {date.toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric' 
                                        })}
                                        {isRecent && <span className="block text-xs text-green-600 font-semibold">Recent</span>}
                                      </div>
                                      <div className="flex-1 bg-gray-200 rounded-full h-3 sm:h-4 relative overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full transition-all duration-500 ${roleColors[role]} ${isRecent ? 'animate-pulse' : ''}`}
                                          style={{ width: `${Math.max(percentage, 5)}%` }}
                                        ></div>
                                        {percentage > 50 && (
                                          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                                            {Math.round(percentage)}%
                                          </span>
                                        )}
                                      </div>
                                      <div className="w-8 sm:w-10 text-xs sm:text-sm font-semibold text-gray-900 text-right">
                                        {count}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Mini insights for each role */}                                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                                <div className="flex justify-between">
                                  <span>Growth trend:</span>
                                  <span className="font-medium">
                                    {roleData.length > 1 && 
                                     parseInt(roleData[roleData.length - 1]?.dataValues?.count || roleData[roleData.length - 1]?.count || 0) > 
                                     parseInt(roleData[0]?.dataValues?.count || roleData[0]?.count || 0)
                                      ? '📈 Increasing' 
                                      : '📊 Stable'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 sm:py-12">
                        <UserPlus className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                        <p className="text-sm sm:text-base text-gray-500">No registration data available for this period</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Appointment Trends */}
                {activeChart === 'appointments' && (
                  <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">Appointment Analysis</h3>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {periodOptions.find(p => p.value === period)?.label}
                      </span>
                    </div>

                    {analyticsData?.appointmentTrends && analyticsData.appointmentTrends.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {/* Appointment Status Overview */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-4">
                          {['pending', 'approved', 'completed', 'cancelled', 'rejected'].map(status => {
                            const statusData = analyticsData.appointmentTrends.filter(at => at.status === status);
                            const totalCount = statusData.reduce((sum, item) => {
                              const count = item?.dataValues?.count || item?.count || 0;
                              return sum + parseInt(count);
                            }, 0);
                            
                            const statusInfo = {
                              pending: { icon: '⏳', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600' },
                              approved: { icon: '✅', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
                              completed: { icon: '🎉', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
                              cancelled: { icon: '❌', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' },
                              rejected: { icon: '🚫', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600' }
                            };

                            return (
                              <div key={status} className={`${statusInfo[status].bg} ${statusInfo[status].border} border rounded-lg p-2 sm:p-3 text-center`}>
                                <div className="text-base sm:text-lg mb-1">{statusInfo[status].icon}</div>
                                <p className="text-xs font-medium text-gray-600 capitalize">{status}</p>
                                <p className={`text-sm sm:text-lg font-bold ${statusInfo[status].text}`}>{totalCount}</p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Detailed Appointment Charts */}
                        {['pending', 'approved', 'completed', 'cancelled', 'rejected'].map(status => {
                          const statusData = analyticsData.appointmentTrends.filter(at => at.status === status);
                          if (statusData.length === 0) return null;

                          const totalCount = statusData.reduce((sum, item) => {
                            const count = item?.dataValues?.count || item?.count || 0;
                            return sum + parseInt(count);
                          }, 0);
                          const maxCount = Math.max(...statusData.map(item => {
                            const count = item?.dataValues?.count || item?.count || 0;
                            return parseInt(count);
                          }), 1);

                          const statusColors = {
                            pending: 'bg-yellow-500',
                            approved: 'bg-blue-500',
                            completed: 'bg-green-500',
                            cancelled: 'bg-red-500',
                            rejected: 'bg-gray-500'
                          };

                          const statusBgColors = {
                            pending: 'bg-yellow-50 border-yellow-200',
                            approved: 'bg-blue-50 border-blue-200',
                            completed: 'bg-green-50 border-green-200',
                            cancelled: 'bg-red-50 border-red-200',
                            rejected: 'bg-gray-50 border-gray-200'
                          };

                          const statusIcons = {
                            pending: '⏳',
                            approved: '✅',
                            completed: '🎉',
                            cancelled: '❌',
                            rejected: '🚫'
                          };

                          return (
                            <div key={status} className={`border rounded-lg p-3 sm:p-4 ${statusBgColors[status]} transition-all hover:shadow-md`}>
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-4">
                                <h4 className="text-sm sm:text-base font-medium text-gray-900 capitalize flex items-center">
                                  <span className="text-lg mr-2">{statusIcons[status]}</span>
                                  <div className={`w-3 h-3 rounded-full mr-2 ${statusColors[status]}`}></div>
                                  {status} Appointments
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs sm:text-sm font-semibold text-gray-700 bg-white px-2 py-1 rounded">
                                    Total: {totalCount}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Rate: {Math.round((totalCount / Math.max(analyticsData.appointmentTrends.reduce((sum, item) => {
                                      const count = item?.dataValues?.count || item?.count || 0;
                                      return sum + parseInt(count);
                                    }, 0), 1)) * 100)}%
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2 sm:space-y-3">
                                {statusData.map((item, index) => {
                                  const count = parseInt(item?.dataValues?.count || item?.count || 0);
                                  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                                  const date = new Date(item?.dataValues?.date || item?.date || new Date());
                                  const isRecent = Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
                                  
                                  return (
                                    <div key={index} className={`flex items-center gap-3 sm:gap-4 ${isRecent ? 'bg-white rounded-md p-2' : ''}`}>
                                      <div className="w-16 sm:w-20 text-xs sm:text-sm text-gray-600 font-medium">
                                        {date.toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric' 
                                        })}
                                        {isRecent && <span className="block text-xs text-blue-600 font-semibold">Recent</span>}
                                      </div>
                                      <div className="flex-1 bg-gray-200 rounded-full h-3 sm:h-4 relative overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full transition-all duration-500 ${statusColors[status]} ${isRecent ? 'animate-pulse' : ''}`}
                                          style={{ width: `${Math.max(percentage, 5)}%` }}
                                        ></div>
                                        {percentage > 30 && (
                                          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                                            {count}
                                          </span>
                                        )}
                                      </div>
                                      <div className="w-8 sm:w-10 text-xs sm:text-sm font-semibold text-gray-900 text-right">
                                        {count}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Status-specific insights */}
                              <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                                <div className="flex justify-between">
                                  <span>Pattern:</span>
                                  <span className="font-medium">
                                    {status === 'completed' ? '✨ High quality care' :
                                     status === 'pending' ? '⚡ Quick response needed' :
                                     status === 'approved' ? '🎯 Good conversion' :
                                     status === 'cancelled' ? '⚠️ Needs attention' :
                                     '📋 Administrative review'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 sm:py-12">
                        <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                        <p className="text-sm sm:text-base text-gray-500">No appointment data available for this period</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Performance Metrics */}
                {activeChart === 'performance' && dashboardData && (
                  <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">Performance Insights</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Top Doctors */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                          <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                          Top Performing Doctors
                        </h4>
                        {dashboardData.topDoctors && dashboardData.topDoctors.length > 0 ? (
                          <div className="space-y-3">
                            {dashboardData.topDoctors.map((doctor, index) => (
                              <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                                <div className="flex items-center">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-xs sm:text-sm font-bold text-blue-600">
                                      #{index + 1}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                                      Dr. {doctor.doctorName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      High patient satisfaction
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm sm:text-base font-bold text-gray-900">
                                    {doctor.appointmentCount}
                                  </p>
                                  <p className="text-xs text-gray-500">appointments</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">No doctor performance data available</p>
                        )}
                      </div>

                      {/* Hospital Utilization */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 sm:p-6">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                          <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
                          Hospital Network Activity
                        </h4>
                        {dashboardData.hospitalStats && dashboardData.hospitalStats.length > 0 ? (
                          <div className="space-y-3">
                            {dashboardData.hospitalStats.map((hospital, index) => {
                              const maxCount = Math.max(...dashboardData.hospitalStats.map(h => h.appointmentCount));
                              const percentage = (hospital.appointmentCount / maxCount) * 100;
                              
                              return (
                                <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate pr-2">
                                      {hospital.hospitalName}
                                    </p>
                                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                                      {hospital.appointmentCount}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${Math.max(percentage, 5)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">No hospital utilization data available</p>
                        )}
                      </div>
                    </div>

                    {/* Monthly Trends */}
                    {dashboardData.monthlyAppointments && (
                      <div className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 sm:p-6">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
                          6-Month Appointment Trends
                        </h4>
                        <div className="space-y-3">
                          {dashboardData.monthlyAppointments.map((month, index) => {
                            const maxCount = Math.max(...dashboardData.monthlyAppointments.map(m => m.count));
                            const percentage = maxCount > 0 ? (month.count / maxCount) * 100 : 0;
                            
                            return (
                              <div key={index} className="flex items-center gap-3 sm:gap-4">
                                <div className="w-12 sm:w-16 text-xs sm:text-sm text-gray-600 font-medium">
                                  {month.month}
                                </div>
                                <div className="flex-1 bg-white rounded-full h-3 sm:h-4 relative overflow-hidden shadow-sm">
                                  <div 
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.max(percentage, 5)}%` }}
                                  ></div>
                                </div>
                                <div className="w-8 sm:w-12 text-xs sm:text-sm font-bold text-gray-900 text-right">
                                  {month.count}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Peak Hours Analysis */}
                {activeChart === 'hours' && (
                  <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">Peak Hours Analysis</h3>
                      <span className="text-xs sm:text-sm text-gray-500">
                        Most popular appointment times
                      </span>
                    </div>

                    {analyticsData?.peakHours && analyticsData.peakHours.length > 0 ? (
                      <div className="space-y-4 sm:space-y-6">
                        {/* Peak Hours Overview Cards */}
                        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 sm:p-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className="bg-white rounded-lg p-3 sm:p-4 text-center shadow-sm border border-orange-100">
                              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 mx-auto mb-2" />
                              <p className="text-lg sm:text-xl font-bold text-gray-900">
                                {analyticsData.peakHours[0]?.time || 'N/A'}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">Peak Hour</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 sm:p-4 text-center shadow-sm border border-red-100">
                              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 mx-auto mb-2" />
                              <p className="text-lg sm:text-xl font-bold text-gray-900">
                                {analyticsData.peakHours[0]?.count || 0}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">Peak Bookings</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 sm:p-4 text-center shadow-sm border border-green-100">
                              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mx-auto mb-2" />
                              <p className="text-lg sm:text-xl font-bold text-gray-900">
                                {analyticsData.peakHours.length}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">Active Hours</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 sm:p-4 text-center shadow-sm border border-blue-100">
                              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mx-auto mb-2" />
                              <p className="text-lg sm:text-xl font-bold text-gray-900">
                                {Math.round(analyticsData.peakHours.reduce((sum, h) => sum + h.count, 0) / analyticsData.peakHours.length)}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">Avg/Hour</p>
                            </div>
                          </div>

                          {/* Hourly Breakdown */}
                          <div className="space-y-2 sm:space-y-3">
                            {analyticsData.peakHours.map((hour, index) => {
                              const maxCount = Math.max(...analyticsData.peakHours.map(h => h.count));
                              const percentage = (hour.count / maxCount) * 100;
                              const isPeakHour = index === 0;
                              const isHighActivity = hour.count > maxCount * 0.7;
                              
                              return (
                                <div key={index} className={`flex items-center gap-3 sm:gap-4 bg-white rounded-lg p-3 shadow-sm transition-all hover:shadow-md ${isPeakHour ? 'ring-2 ring-orange-200' : ''}`}>
                                  <div className="w-12 sm:w-16 text-xs sm:text-sm font-bold text-gray-900 flex items-center">
                                    {isPeakHour && <span className="text-orange-500 mr-1">🏆</span>}
                                    {hour.time}
                                  </div>
                                  <div className="flex-1 bg-gray-200 rounded-full h-3 sm:h-4 relative overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        isPeakHour 
                                          ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                                          : isHighActivity 
                                            ? 'bg-gradient-to-r from-orange-400 to-yellow-400'
                                            : 'bg-gradient-to-r from-yellow-300 to-orange-300'
                                      }`}
                                      style={{ width: `${Math.max(percentage, 5)}%` }}
                                    ></div>
                                    {percentage > 25 && (
                                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                                        {hour.count}
                                      </span>
                                    )}
                                  </div>
                                  <div className="w-10 sm:w-12 text-xs sm:text-sm font-bold text-gray-900 text-right">
                                    {hour.count}
                                  </div>
                                  <div className="w-12 sm:w-14 text-xs text-gray-600 text-right">
                                    <span className={`font-medium ${
                                      isPeakHour ? 'text-orange-600' : 
                                      isHighActivity ? 'text-yellow-600' : 
                                      'text-gray-500'
                                    }`}>
                                      {Math.round(percentage)}%
                                    </span>
                                  </div>
                                  <div className="w-6 flex justify-center">
                                    {isPeakHour && <span className="text-sm">🔥</span>}
                                    {isHighActivity && !isPeakHour && <span className="text-sm">⭐</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Enhanced Insights */}
                          <div className="mt-4 sm:mt-6 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Time-based insights */}
                              <div className="p-3 sm:p-4 bg-white rounded-lg border-l-4 border-orange-400">
                                <h5 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                  📊 Time Analysis
                                </h5>
                                <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                                  <li>• Peak appointment time: {analyticsData.peakHours[0]?.time} ({analyticsData.peakHours[0]?.count} bookings)</li>
                                  <li>• Busiest period: {
                                    analyticsData.peakHours.slice(0, 3).map(h => h.time).join(', ')
                                  }</li>
                                  <li>• Total appointments tracked: {analyticsData.peakHours.reduce((sum, h) => sum + h.count, 0)}</li>
                                </ul>
                              </div>

                              {/* Operational insights */}
                              <div className="p-3 sm:p-4 bg-white rounded-lg border-l-4 border-blue-400">
                                <h5 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                  💡 Recommendations
                                </h5>
                                <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                                  <li>• Optimize staff scheduling for {analyticsData.peakHours[0]?.time}</li>
                                  <li>• Consider incentives for off-peak hours</li>
                                  <li>• Monitor capacity during high-demand periods</li>
                                </ul>
                              </div>
                            </div>

                            {/* Mobile-optimized data table */}
                            <div className="lg:hidden bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                <h6 className="text-sm font-medium text-gray-900">Hourly Breakdown</h6>
                              </div>
                              <div className="divide-y divide-gray-200">
                                {analyticsData.peakHours.map((hour, index) => (
                                  <div key={index} className="px-4 py-3 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-900">{hour.time}</span>
                                      {index === 0 && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">Peak</span>}
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-semibold text-gray-900">{hour.count}</div>
                                      <div className="text-xs text-gray-500">{Math.round((hour.count / Math.max(...analyticsData.peakHours.map(h => h.count))) * 100)}%</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 sm:py-12">
                        <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                        <p className="text-sm sm:text-base text-gray-500">No peak hours data available for this period</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Insights & Trends */}
            <div className="space-y-6">
              {/* Real-time Health Metrics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-3 sm:py-4">
                  <h3 className="text-base sm:text-lg font-medium text-white flex items-center">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Platform Health Metrics
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* System Efficiency */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">System Efficiency</h4>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Appointment Success Rate</span>
                          <span className="font-semibold text-green-600">
                            {dashboardData ? Math.round(
                              ((dashboardData?.appointmentsByStatus?.completed || 0) + 
                               (dashboardData?.appointmentsByStatus?.approved || 0)) / 
                              Math.max(dashboardData?.totals?.appointments || 1, 1) * 100
                            ) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${dashboardData ? Math.round(
                                ((dashboardData?.appointmentsByStatus?.completed || 0) + 
                                 (dashboardData?.appointmentsByStatus?.approved || 0)) / 
                                Math.max(dashboardData?.totals?.appointments || 1, 1) * 100
                              ) : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Doctor Availability</span>
                          <span className="font-medium">
                            {dashboardData ? Math.round(((dashboardData?.totals?.doctors || 0) / Math.max((dashboardData?.totals?.hospitals || 1) * 10, 1)) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* User Engagement */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">User Engagement</h4>
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                      </div>                        <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Active Users</span>
                          <span className="font-semibold text-blue-600">
                            {formatNumber(dashboardData?.totals?.users || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Patient Retention</span>
                          <span className="font-semibold text-blue-600">
                            {dashboardData ? Math.round(((dashboardData?.totals?.patients || 0) / Math.max(dashboardData?.totals?.users || 1, 1)) * 100) : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Growth Rate</span>
                          <span className="font-medium">
                            +{dashboardData?.growth?.newUsersThisMonth || 0} this month
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Network Coverage */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">Network Coverage</h4>
                        <Building2 className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Hospital Partners</span>
                          <span className="font-semibold text-purple-600">
                            {formatNumber(dashboardData?.totals?.hospitals || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Avg. Doctors/Hospital</span>
                          <span className="font-semibold text-purple-600">
                            {(dashboardData?.totals?.hospitals || 0) > 0 ? 
                              Math.round((dashboardData?.totals?.doctors || 0) / (dashboardData?.totals?.hospitals || 1)) : 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Coverage Score</span>
                          <span className="font-medium">Excellent</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Analytics Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6 flex items-center">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-600" />
                  Comprehensive Analytics Summary
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <Activity className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-gray-900">Data Points</h4>
                    <p className="text-3xl font-bold text-blue-600 mb-1">
                      {formatNumber(
                        (analyticsData?.userRegistrations?.length || 0) + 
                        (analyticsData?.appointmentTrends?.length || 0) + 
                        (analyticsData?.peakHours?.length || 0)
                      )}
                    </p>
                    <p className="text-sm text-gray-600">Metrics collected</p>
                    <div className="mt-2 text-xs text-blue-600 font-medium">
                      Last updated: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-gray-900">Growth Rate</h4>
                    <p className="text-3xl font-bold text-green-600 mb-1">
                      {dashboardData ? calculateGrowthPercentage(
                        dashboardData?.growth?.newUsersThisMonth || 0, 
                        Math.max((dashboardData?.growth?.newUsersThisMonth || 0) - 10, 0)
                      ) : 0}%
                    </p>
                    <p className="text-sm text-gray-600">Monthly growth</p>
                    <div className="mt-2 flex items-center justify-center">
                      {getGrowthIcon(dashboardData?.growth?.newUsersThisMonth || 0)}
                      <span className="ml-1 text-xs text-green-600 font-medium">Trending up</span>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <PieChart className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-gray-900">Success Rate</h4>
                    <p className="text-3xl font-bold text-purple-600 mb-1">
                      {dashboardData ? Math.round(
                        ((dashboardData?.appointmentsByStatus?.completed || 0) + 
                         (dashboardData?.appointmentsByStatus?.approved || 0)) / 
                        Math.max(dashboardData?.totals?.appointments || 1, 1) * 100
                      ) : 0}%
                    </p>
                    <p className="text-sm text-gray-600">Appointment success</p>
                    <div className="mt-2 text-xs text-purple-600 font-medium">
                      {dashboardData?.appointmentsByStatus?.completed || 0} completed
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <Clock className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-gray-900">Peak Time</h4>
                    <p className="text-3xl font-bold text-orange-600 mb-1">
                      {analyticsData?.peakHours && analyticsData.peakHours.length > 0 
                        ? analyticsData.peakHours[0].time 
                        : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">Most popular hour</p>
                    <div className="mt-2 text-xs text-orange-600 font-medium">
                      {analyticsData?.peakHours && analyticsData.peakHours.length > 0 
                        ? `${analyticsData.peakHours[0].count} bookings`
                        : 'No data'}
                    </div>
                  </div>
                </div>

                {/* Key Insights Panel */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-red-500" />
                    Key Insights & Recommendations
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-900">Performance Highlights</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          Platform serves {formatNumber(dashboardData?.totals?.users || 0)} users across {formatNumber(dashboardData?.totals?.hospitals || 0)} hospitals
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {dashboardData?.growth?.newUsersThisMonth || 0} new users joined this month
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {analyticsData?.peakHours && analyticsData.peakHours.length > 0 
                            ? `Peak activity at ${analyticsData.peakHours[0].time}`
                            : 'Optimal scheduling data available'}
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-900">Strategic Recommendations</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          Consider expanding during peak hours for better user experience
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          Focus on doctor onboarding to meet growing demand
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          Monitor appointment success rates for quality assurance
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Export and Actions */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Report Period:</span> {periodOptions.find(p => p.value === period)?.label}
                      <span className="ml-4 font-medium">Generated:</span> {new Date().toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Print
                      </button>
                      <button
                        onClick={() => {
                          const element = document.createElement('a');
                          const file = new Blob([JSON.stringify({
                            dashboardData,
                            analyticsData,
                            period,
                            generated: new Date().toISOString()
                          }, null, 2)], {type: 'application/json'});
                          element.href = URL.createObjectURL(file);
                          element.download = `analytics_${period}_${new Date().toISOString().split('T')[0]}.json`;
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                          toast.success('Raw data exported as JSON');
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        JSON
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
