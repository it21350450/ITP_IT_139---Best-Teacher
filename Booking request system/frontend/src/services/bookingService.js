import axios from 'axios';

// Create configured axios instance
// Assume JWT auth token is already being injected via interceptors elsewhere,
// or we can attach it here if token is available in local storage.
const apiClient = axios.create({
  baseURL: '/api/bookings',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (config.headers.set) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Inject Mock Role Header for Backend
  const mockRole = localStorage.getItem('mockRole') || 'student';
  if (config.headers.set) {
    config.headers.set('x-mock-role', mockRole);
  } else {
    config.headers['x-mock-role'] = mockRole;
  }

  return config;
});

// Create new booking (Student)
export const createBooking = async (bookingData) => {
  const { data } = await apiClient.post('/', bookingData);
  return data;
};

// Get user's bookings (Student or Teacher)
export const getMyBookings = async ({ page = 1, limit = 10, status }) => {
  const params = { page, limit };
  if (status) {
    params.status = status;
  }
  
  const { data } = await apiClient.get('/', { params });
  return data;
};

// Get single booking by ID
export const getBookingById = async (id) => {
  const { data } = await apiClient.get(`/${id}`);
  return data;
};

// Update booking details (Student, while pending)
export const updateBooking = async (id, bookingData) => {
  const { data } = await apiClient.put(`/${id}`, bookingData);
  return data;
};

// Update status (e.g., Cancel, Confirm, Complete)
export const updateBookingStatus = async (id, statusData) => {
  // statusData shape: { status: 'cancelled', cancellationReason: 'optional reason' }
  const { data } = await apiClient.patch(`/${id}/status`, statusData);
  return data;
};

const bookingService = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  updateBooking,
};

export default bookingService;
