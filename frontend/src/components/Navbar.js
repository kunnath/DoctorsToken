import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Stethoscope, User, LogOut, Calendar, UserCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Doctors Token</span>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex space-x-6">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>

              {user.role === 'patient' && (
                <>
                  <Link
                    to="/book-appointment"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/book-appointment')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                    }`}
                  >
                    Book Appointment
                  </Link>
                  <Link
                    to="/my-appointments"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/my-appointments')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                    }`}
                  >
                    My Appointments
                  </Link>
                </>
              )}

              {user.role === 'doctor' && (
                <>
                  <Link
                    to="/doctor-dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/doctor-dashboard')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                    }`}
                  >
                    Appointments
                  </Link>
                  <Link
                    to="/my-appointments"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/my-appointments')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                    }`}
                  >
                    Schedule
                  </Link>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin/dashboard')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                    }`}
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin/users')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                    }`}
                  >
                    User Management
                  </Link>
                  <Link
                    to="/admin/analytics"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin/analytics')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                    }`}
                  >
                    Analytics
                  </Link>
                </>
              )}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user.role === 'doctor' ? (
                    <UserCheck className="h-5 w-5 text-primary-600" />
                  ) : (
                    <User className="h-5 w-5 text-primary-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                  <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm text-gray-700 hover:text-danger-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {user && (
        <div className="md:hidden border-t border-gray-200 bg-gray-50">
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-wrap gap-2">
              <Link
                to="/dashboard"
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-primary-100'
                }`}
              >
                Dashboard
              </Link>

              {user.role === 'patient' && (
                <>
                  <Link
                    to="/book-appointment"
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      isActive('/book-appointment')
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-primary-100'
                    }`}
                  >
                    Book
                  </Link>
                  <Link
                    to="/my-appointments"
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      isActive('/my-appointments')
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-primary-100'
                    }`}
                  >
                    Appointments
                  </Link>
                </>
              )}

              {user.role === 'doctor' && (
                <>
                  <Link
                    to="/doctor-dashboard"
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      isActive('/doctor-dashboard')
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-primary-100'
                    }`}
                  >
                    Appointments
                  </Link>
                  <Link
                    to="/my-appointments"
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      isActive('/my-appointments')
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-primary-100'
                    }`}
                  >
                    Schedule
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
