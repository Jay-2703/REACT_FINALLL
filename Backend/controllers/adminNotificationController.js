import { query } from '../config/db.js';
import { getIO } from '../config/socket.js';
import { createNotification } from '../services/notificationService.js';

/**
 * Get notifications
 * GET /api/admin/notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const { user_id, type, is_read, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT n.*, u.username, u.email
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.user_id = ?
    `;
    const params = [req.user.id]; // For admins, show notifications intended for them

    if (user_id) {
      sql += ' AND n.user_id = ?';
      params.push(user_id);
    }
    if (type) {
      sql += ' AND n.notification_type = ?';
      params.push(type);
    }
    if (is_read !== undefined) {
      sql += ' AND n.is_read = ?';
      params.push(is_read === 'true' ? 1 : 0);
    }

    // Get total count
    const countSql = sql.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as count FROM');
    const countResult = await query(countSql, params);
    const total = countResult[0]?.count || 0;

    sql += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const notifications = await query(sql, params);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

/**
 * Create notification (Admin API endpoint)
 * POST /api/admin/notifications
 */
export const createAdminNotification = async (req, res) => {
  try {
    const { user_id, type, title, message, link } = req.body;

    if (!type || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, message'
      });
    }

    // Delegate creation to notification service so broadcast logic is consistent
    const created = await createNotification({ user_id: user_id || null, type, title: title || type, message, link });

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description, success) VALUES (?, ?, ?, ?)',
      [req.user.id, 'notification_created', JSON.stringify({ created, type, user_id }), 1]
    );

    res.json({
      success: true,
      message: 'Notification created successfully',
      data: { created }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
};

/**
 * Mark notification as read
 * PUT /api/admin/notifications/:id/read
 */
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    await query('UPDATE notifications SET is_read = 1 WHERE notification_id = ?', [id]);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

/**
 * Mark all notifications as read
 * PUT /api/admin/notifications/read-all
 */
export const markAllNotificationsRead = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (user_id) {
      await query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [user_id]);
    } else {
      await query('UPDATE notifications SET is_read = 1 WHERE is_read = 0');
    }

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

/**
 * Get unread notification count
 * GET /api/admin/notifications/unread-count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const { user_id } = req.query;

    let sql = 'SELECT COUNT(*) as count FROM notifications WHERE is_read = 0';
    const params = [];

    if (user_id) {
      sql += ' AND user_id = ?';
      params.push(user_id);
    }

    const result = await query(sql, params);

    res.json({
      success: true,
      data: {
        unreadCount: result[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
};

/**
 * Get activity logs
 * GET /api/admin/activity-logs
 */
export const getActivityLogs = async (req, res) => {
  try {
    const { user_id, action, entity_type, start_date, end_date, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT 
        al.log_id as id,
        al.log_id,
        al.user_id,
        CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) as user,
        u.email,
        al.action as action_type,
        al.entity_type as service_type,
        al.entity_type,
        al.description,
        IF(al.success = 1, 'Success', 'Failed') as status,
        al.ip_address,
        al.created_at as timestamp
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      sql += ' AND al.user_id = ?';
      params.push(user_id);
    }
    if (action) {
      sql += ' AND al.action = ?';
      params.push(action);
    }
    if (entity_type) {
      sql += ' AND al.entity_type = ?';
      params.push(entity_type);
    }
    if (start_date) {
      sql += ' AND al.created_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND al.created_at <= ?';
      params.push(end_date);
    }

    // Get total count
    const countSql = sql.replace(/SELECT[\s\S]*?FROM activity_logs/, 'SELECT COUNT(*) as count FROM activity_logs');
    const countResults = await query(countSql, params);
    const total = countResults[0]?.count || 0;

    sql += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const logs = await query(sql, params);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs'
    });
  }
};

