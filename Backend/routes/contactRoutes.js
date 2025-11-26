import express from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import {
  submitContactMessage,
  getContactMessages,
  markMessageAsRead,
  deleteContactMessage
} from '../controllers/contactController.js';

const router = express.Router();

/**
 * Contact Routes
 */

// Submit contact form (public)
router.post('/submit', optionalAuth, submitContactMessage);

// Get all contact messages (admin only)
router.get('/messages', requireAuth, getContactMessages);

// Mark message as read (admin only)
router.put('/messages/:messageId/read', requireAuth, markMessageAsRead);

// Delete contact message (admin only)
router.delete('/messages/:messageId', requireAuth, deleteContactMessage);

export default router;
