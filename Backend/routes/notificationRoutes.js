import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getUserNotifications,
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationCount,
  getUserRegistrationNotifications
} from '../controllers/notificationController.js';

const router = express.Router();

/**
 * Notification Routes
 * All routes require authentication
 */

// Get personal notifications for user
router.get('/', requireAuth, getUserNotifications);

// Get unread notification count (personal)
router.get('/count', requireAuth, getNotificationCount);

// Get admin system notifications (admin only)
router.get('/admin/system', requireAuth, getAdminNotifications);

// Get user registration notifications (admin only)
router.get('/admin/registrations', requireAuth, getUserRegistrationNotifications);

// Mark single notification as read
router.put('/:notificationId/read', requireAuth, markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', requireAuth, markAllNotificationsAsRead);

export default router;
