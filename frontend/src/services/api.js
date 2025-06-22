import axios from 'axios';

// Function to get the correct API base URL
const getApiBaseUrl = () => {
  // Check if environment variable is set
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Get current hostname and use it for API
  const hostname = window.location.hostname;
  
  // If accessing via IP address or custom hostname, use the same for backend
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:5000/api`;
  }
  
  // Default to localhost
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  createDoctorProfile: (profileData) => api.post('/auth/doctor-profile', profileData),
};

// Doctors API
export const doctorsAPI = {
  search: (params) => api.get('/doctors/search', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getSpecializations: () => api.get('/doctors/specializations/list'),
  updateProfile: (profileData) => api.put('/doctors/profile', profileData),
};

// Hospitals API
export const hospitalsAPI = {
  search: (params) => api.get('/hospitals/search', { params }),
  getById: (id) => api.get(`/hospitals/${id}`),
  getDoctors: (id, params) => api.get(`/hospitals/${id}/doctors`, { params }),
};

// Appointments API
export const appointmentsAPI = {
  create: (appointmentData) => api.post('/appointments', appointmentData),
  getMyAppointments: (params) => api.get('/appointments/my-appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  updateStatus: (id, statusData) => api.patch(`/appointments/${id}/status`, statusData),
  cancel: (id, reason) => api.patch(`/appointments/${id}/cancel`, { reason }),
};

// GPS API
export const gpsAPI = {
  verify: (appointmentId, location) => api.post(`/gps/verify/${appointmentId}`, location),
  getStatus: (appointmentId) => api.get(`/gps/status/${appointmentId}`),
};

export default api;
