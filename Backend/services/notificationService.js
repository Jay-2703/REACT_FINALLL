import { query } from '../config/db.js';
import { getIO } from '../config/socket.js';

/**
 * Notification Service
 * Handles creation, storage, and real-time delivery of notifications
 */

/**
 * Create a notification and broadcast to admins
 * @param {Object} notificationData - Notification data
 * @param {number|null} notificationData.user_id - Target user ID (null for broadcast to all admins)
 * @param {string} notificationData.type - Notification type (booking_received, booking_confirmed, etc)
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message (will be sanitized)
 * @param {string|null} notificationData.link - Optional link to related page
 * @returns {Promise<number>} Notification ID
 */
export async function createNotification({ user_id = null, type, title, message, link = null }) {
  try {
    // Sanitize message to prevent XSS
    const sanitizedMessage = sanitizeMessage(message);
    const sanitizedTitle = sanitizeMessage(title || type);

    // If user_id is null, this is an admin/system broadcast.
    // The notifications table requires a valid user_id (FK), so
    // create a notification row for each admin user instead.
    if (user_id === null) {
      const admins = await query('SELECT id FROM users WHERE role = ?', ['admin']);

      if (!admins || admins.length === 0) {
        console.warn('No admin users found to receive broadcast notification');
        return null;
      }

      // Build bulk insert for admins
      const placeholders = admins.map(() => '(?, ?, ?, ?, 0, NOW())').join(', ');
      const params = [];
      admins.forEach((a) => {
        params.push(a.id, type, sanitizedTitle, sanitizedMessage);
      });

      await query(
        `INSERT INTO notifications (user_id, notification_type, title, message, is_read, created_at) VALUES ${placeholders}`,
        params
      );

      // Broadcast to connected admin clients and emit a generic admin event
      await broadcastNotification({ notification_type: type, title: sanitizedTitle, message: sanitizedMessage, is_read: 0, created_at: new Date() }, null);

      return true;
    }

    // Insert notification for a specific user
    const result = await query(
      'INSERT INTO notifications (user_id, notification_type, title, message, is_read, created_at) VALUES (?, ?, ?, ?, 0, NOW())',
      [user_id, type, sanitizedTitle, sanitizedMessage]
    );

    const notificationId = result.insertId;

    // Get the created notification
    const rows = await query(
      'SELECT * FROM notifications WHERE notification_id = ?',
      [notificationId]
    );

    const notification = rows && rows[0];

    // Broadcast to the specific user via Socket.IO
    if (notification) {
      await broadcastNotification(notification, user_id);
    }

    return notificationId;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Broadcast notification to admins via Socket.IO
 * @param {Object} notification - Notification object
 * @param {number|null} targetUserId - Specific user ID or null for all admins
 */
async function broadcastNotification(notification, targetUserId = null) {
  try {
    const io = getIO();
    if (!io) {
      console.warn('Socket.IO not initialized, notification not broadcasted');
      return;
    }

    if (targetUserId) {
      // Send to specific user
      io.to(`user:${targetUserId}`).emit('notification', {
        notification_id: notification.notification_id || notification.id,
        notification_type: notification.notification_type || notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link || null,
        is_read: !!notification.is_read,
        created_at: notification.created_at || new Date()
      });
    } else {
      // Broadcast to all admins and instructors
      // Use emit to all connected clients, they'll filter on frontend
      io.emit('admin_notification', {
        notification_id: notification.notification_id || notification.id,
        notification_type: notification.notification_type || notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link || null,
        is_read: !!notification.is_read,
        created_at: notification.created_at || new Date()
      });
    }

    console.log(`📢 Notification broadcasted: ${notification.notification_type || notification.type || 'unknown'} - ${notification.message}`);
  } catch (error) {
    console.error('Error broadcasting notification:', error);
  }
}

/**
 * Notify all admins about an event
 * @param {string} type - Notification type
 * @param {string} message - Notification message
 * @param {string|null} link - Optional link
 */
export async function notifyAdmins(type, message, link = null) {
  return await createNotification({
    user_id: null, // null = broadcast to all admins
    type,
    message,
    link
  });
}

/**
 * Notify specific user
 * @param {number} userId - User ID
 * @param {string} type - Notification type
 * @param {string} message - Notification message
 * @param {string|null} link - Optional link
 */
export async function notifyUser(userId, type, message, link = null) {
  return await createNotification({
    user_id: userId,
    type,
    message,
    link
  });
}

/**
 * Sanitize message to prevent XSS
 * @param {string} message - Raw message
 * @returns {string} Sanitized message
 */
function sanitizeMessage(message) {
  if (typeof message !== 'string') {
    return String(message);
  }

  // Remove HTML tags and escape special characters
  return message
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Get unread notification count for a user (PERSONAL NOTIFICATIONS ONLY)
 * @param {number} userId - User ID
 * @returns {Promise<number>} Unread count
 */
export async function getUnreadCount(userId) {
  try {
    if (!userId) {
      return 0;
    }

    // Only count personal notifications, NOT admin system notifications
    const result = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE is_read = 0 AND user_id = ?',
      [userId]
    );
    
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Get unread count for admin system notifications (user_id IS NULL)
 * @returns {Promise<number>} Unread admin notification count
 */
export async function getAdminUnreadCount() {
  try {
    // Count unread notifications for users with role = 'admin'
    const result = await query(
      `SELECT COUNT(*) as count FROM notifications n JOIN users u ON n.user_id = u.id WHERE n.is_read = 0 AND u.role = 'admin'`,
      []
    );

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error getting admin unread count:', error);
    return 0;
  }
}

/**
 * Mark notification as read
 * @param {number} notificationId - Notification ID
 * @param {number} userId - User ID (for verification)
 */
export async function markAsRead(notificationId, userId = null) {
  try {
    let sql = 'UPDATE notifications SET is_read = 1 WHERE notification_id = ?';
    const params = [notificationId];

    if (userId) {
      // Only allow marking if this notification belongs to the user
      sql += ' AND user_id = ?';
      params.push(userId);
    }

    await query(sql, params);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user (PERSONAL ONLY)
 * @param {number} userId - User ID
 */
export async function markAllAsRead(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Only mark personal notifications as read, NOT admin system notifications
    await query(
      'UPDATE notifications SET is_read = 1 WHERE is_read = 0 AND user_id = ?',
      [userId]
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Mark all admin system notifications as read
 */
export async function markAllAdminNotificationsAsRead() {
  try {
    // Mark notifications as read for admin users
    await query(
      `UPDATE notifications n JOIN users u ON n.user_id = u.id SET n.is_read = 1 WHERE n.is_read = 0 AND u.role = 'admin'`,
      []
    );
  } catch (error) {
    console.error('Error marking all admin notifications as read:', error);
    throw error;
  }
}