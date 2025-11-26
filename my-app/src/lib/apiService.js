import api from './api';

/**
 * API Service - All backend API calls
 */
export const apiService = {
  // ==================== AUTH ====================
  
  /**
   * Send registration OTP
   * POST /api/auth/send-registration-otp
   */
  sendRegistrationOTP: async (userData) => {
    const response = await api.post('/auth/send-registration-otp', userData);
    return response.data;
  },

  /**
   * Verify registration OTP and create account
   * POST /api/auth/verify-registration-otp
   */
  verifyRegistrationOTP: async (data) => {
    const response = await api.post('/auth/verify-registration-otp', data);
    // Store token and user data
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Resend registration OTP
   * POST /api/auth/resend-registration-otp
   */
  resendRegistrationOTP: async (email) => {
    const response = await api.post('/auth/resend-registration-otp', { email });
    return response.data;
  },

  /**
   * Login
   * POST /api/auth/login
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    // Store token and user data
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Forgot password - send OTP
   * POST /api/auth/forgot-password
   */
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Verify password reset OTP
   * POST /api/auth/verify-reset-otp
   */
  verifyResetOTP: async (data) => {
    const response = await api.post('/auth/verify-reset-otp', data);
    return response.data;
  },

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  resetPassword: async (data) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Resend password reset OTP
   * POST /api/auth/resend-otp
   */
  resendPasswordResetOTP: async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  /**
   * Logout
   * POST /api/auth/logout
   */
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      return response.data;
    } catch (error) {
      // Still clear data even if logout fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      throw error;
    }
  },

  // ==================== USER PROFILE ====================
  
  /**
   * Get current user profile
   * GET /api/auth/profile
   */
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // ==================== BOOKINGS ====================
  
  /**
   * Get all bookings for current user
   * GET /api/bookings
   */
  getBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },

  /**
   * Create new booking
   * POST /api/bookings
   */
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  /**
   * Get booking by ID
   * GET /api/bookings/:id
   */
  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Update booking
   * PUT /api/bookings/:id
   */
  updateBooking: async (id, bookingData) => {
    const response = await api.put(`/bookings/${id}`, bookingData);
    return response.data;
  },

  /**
   * Cancel booking
   * DELETE /api/bookings/:id
   */
  cancelBooking: async (id) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },

  // ==================== HELPERS ====================
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default apiService;