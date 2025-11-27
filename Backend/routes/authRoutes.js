import express from 'express';
import {
  validateRegistration,
  validateLogin,
  validateOTP,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors
} from '../middleware/validation.js';
import {
  loginRateLimiter,
  registrationRateLimiter,
  otpRateLimiter,
  passwordResetRateLimiter
} from '../middleware/security.js';
import {
  sendRegistrationOTP,
  verifyRegistrationOTP,
  resendRegistrationOTP,
  login,
  adminLogin,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  resendPasswordResetOTP,
  logout,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { googleAuth, googleCallback, facebookAuth, facebookCallback } from '../controllers/oauthController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Registration Flow
 */
// Send registration OTP (receives all registration data, validates, then sends OTP)
router.post(
  '/send-registration-otp',
  registrationRateLimiter,
  validateRegistration, // Validate all registration fields
  handleValidationErrors,
  sendRegistrationOTP
);

// Verify registration OTP and create account
router.post(
  '/verify-registration-otp',
  registrationRateLimiter,
  validateRegistration,
  validateOTP,
  handleValidationErrors,
  verifyRegistrationOTP
);

// Resend registration OTP
router.post(
  '/resend-registration-otp',
  otpRateLimiter,
  validateForgotPassword, // Reuse email validation
  handleValidationErrors,
  resendRegistrationOTP
);

/**
 * Login
 */
router.post(
  '/login',
  loginRateLimiter,
  validateLogin,
  handleValidationErrors,
  login
);

/**
 * Admin Login
 */
router.post(
  '/admin-login',
  loginRateLimiter,
  validateLogin,
  handleValidationErrors,
  adminLogin
);

/**
 * Password Reset Flow
 */
// Forgot password - send OTP
router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  validateForgotPassword,
  handleValidationErrors,
  forgotPassword
);

// Verify OTP for password reset
router.post(
  '/verify-reset-otp',
  otpRateLimiter,
  validateOTP,
  handleValidationErrors,
  verifyResetOTP
);

// Reset password
router.post(
  '/reset-password',
  passwordResetRateLimiter,
  validateResetPassword,
  handleValidationErrors,
  resetPassword
);

// Change password for logged-in user
router.post(
  '/change-password',
  requireAuth,
  changePassword
);

// Resend password reset OTP
router.post(
  '/resend-otp',
  otpRateLimiter,
  validateForgotPassword,
  handleValidationErrors,
  resendPasswordResetOTP
);

/**
 * OAuth Routes
 */
// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Facebook OAuth
router.get('/facebook', facebookAuth);
router.get('/facebook/callback', facebookCallback);

/**
 * Profile Routes (Protected)
 */
// Get current user profile
router.get('/profile', requireAuth, getProfile);

// Update current user profile
router.put('/profile', requireAuth, updateProfile);

/**
 * Logout
 */
router.post('/logout', logout);

export default router;

