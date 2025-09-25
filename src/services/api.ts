import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
};

// Cars API
export const carsApi = {
  getAll: (filters?: any) => api.get('/cars', { params: filters }),
  getById: (id: string) => api.get(`/cars/${id}`),
  getMyCars: () => api.get('/cars/my-cars'),
  checkAvailability: (data: { carId: number; startDate: string; endDate: string }) =>
    api.post('/cars/check-availability', data),
  create: (carData: FormData) => api.post('/cars', carData),
  update: (id: string, carData: FormData) => api.put(`/cars/${id}`, carData),
  delete: (id: string) => api.delete(`/cars/${id}`),
};

// Bookings API
export const bookingsApi = {
  create: (bookingData: any) => api.post('/bookings', bookingData),
  getUserBookings: (userId: string) => api.get(`/bookings/user/${userId}`),
  getByCarId: (carId: string) => api.get(`/bookings/car/${carId}`),
  getAll: () => api.get('/bookings'),
  updateStatus: (id: string, status: string) => api.put(`/bookings/${id}`, { status }),
};

// Payments API
export const paymentsApi = {
  create: (paymentData: any) => api.post('/payments', paymentData),
  getByBookingId: (bookingId: string) => api.get(`/payments/${bookingId}`),
};

// Users API
export const usersApi = {
  getAll: () => api.get('/users'),
  toggleStatus: (id: string) => api.put(`/users/${id}/toggle-status`),
  getStats: () => api.get('/users/dashboard/stats'),
};

export default api;