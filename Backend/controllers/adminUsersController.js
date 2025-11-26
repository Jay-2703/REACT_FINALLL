import { query, getConnection } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/passwordUtils.js';

/**
 * GET /api/admin/users/stats/total
 * Get total users count
 */
export const getTotalUsersCount = async (req, res) => {
  try {
    const [result] = await query(
      'SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL'
    );

    res.json({
      success: true,
      data: {
        total_users: result?.total || 0
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get total users error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'TOTAL_USERS_ERROR'
    });
  }
};

/**
 * GET /api/admin/users/stats/active-today
 * Get users active today
 */
export const getActiveTodayCount = async (req, res) => {
  try {
    const [result] = await query(
      `SELECT COUNT(DISTINCT id) as active_today 
       FROM users 
       WHERE deleted_at IS NULL 
       AND DATE(last_login) = CURDATE()`
    );

    res.json({
      success: true,
      data: {
        active_today: result?.active_today || 0
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get active today error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'ACTIVE_TODAY_ERROR'
    });
  }
};

/**
 * GET /api/admin/users/stats/new-this-month
 * Get new users registered this month
 */
export const getNewThisMonthCount = async (req, res) => {
  try {
    const [result] = await query(
      `SELECT COUNT(*) as new_this_month 
       FROM users 
       WHERE deleted_at IS NULL 
       AND created_at >= DATE_SUB(LAST_DAY(CURDATE()), INTERVAL 1 MONTH)
       AND created_at < DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY)`
    );

    res.json({
      success: true,
      data: {
        new_this_month: result?.new_this_month || 0
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get new this month error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'NEW_MONTH_ERROR'
    });
  }
};

/**
 * GET /api/admin/users
 * Get users list with filters, search, sorting, and pagination
 */
export const getUsersList = async (req, res) => {
  try {
    const { 
      search = '', 
      fromDate = null, 
      toDate = null,
      role = null,
      status = null,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Map sortBy to actual column name
    const sortByMap = {
      'username': 'username',
      'created_at': 'created_at',
      'last_login': 'last_login'
    };
    const sortColumn = sortByMap[sortBy] || 'created_at';
    const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Build WHERE clause
    let whereConditions = ['deleted_at IS NULL'];
    const params = [];

    // Search filter
    if (search) {
      whereConditions.push('(username LIKE ? OR email LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Date range filter
    if (fromDate) {
      whereConditions.push('DATE(created_at) >= ?');
      params.push(fromDate);
    }
    if (toDate) {
      whereConditions.push('DATE(created_at) <= ?');
      params.push(toDate);
    }

    // Role filter
    if (role && ['student', 'instructor', 'admin'].includes(role)) {
      whereConditions.push('role = ?');
      params.push(role);
    }

    // Status filter
    if (status === 'active') {
      whereConditions.push('last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
    } else if (status === 'inactive') {
      whereConditions.push('(last_login IS NULL OR last_login < DATE_SUB(NOW(), INTERVAL 30 DAY))');
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const [countResult] = await query(
      `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`,
      params
    );
    const totalItems = countResult?.total || 0;
    const totalPages = Math.ceil(totalItems / limitNum);

    // Get paginated data
    const users = await query(
      `SELECT 
        id as user_id,
        username,
        email,
        role,
        CASE 
          WHEN last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'Active'
          ELSE 'Inactive'
        END as status,
        DATE_FORMAT(last_login, '%Y-%m-%d') as last_login,
        DATE_FORMAT(created_at, '%Y-%m-%d') as registration_date
       FROM users
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${sortDir}
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: users,
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        per_page: limitNum,
        total_items: totalItems
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get users list error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'USERS_LIST_ERROR'
    });
  }
};

/**
 * GET /api/admin/users/:userId
 * Get user details
 */
export const getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;

    const [user] = await query(
      `SELECT * FROM users 
       WHERE id = ? AND deleted_at IS NULL`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Get user preferences if available
    const [preferences] = await query(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    // Get user XP if student
    const [xpData] = await query(
      'SELECT * FROM user_xp WHERE student_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: {
        ...user,
        preferences: preferences || null,
        xp: xpData || null
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get user detail error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'USER_DETAIL_ERROR'
    });
  }
};

/**
 * POST /api/admin/users
 * Create new user
 */
export const createUser = async (req, res) => {
  try {
    const {
      username,
      first_name,
      last_name,
      email,
      password,
      role = 'student',
      contact = null,
      home_address = null,
      birthday = null
    } = req.body;

    // Validate required fields
    if (!username || !first_name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        code: 'MISSING_FIELDS'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters',
        code: 'WEAK_PASSWORD'
      });
    }

    // Check uniqueness
    const [existingUser] = await query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Username or email already exists',
        code: 'DUPLICATE_USER'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Get connection for transaction
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      // Insert user
      const [result] = await query(
        `INSERT INTO users (
          username, first_name, last_name, email, hashed_password, 
          role, contact, home_address, birthday, is_verified, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, NOW())`,
        [username, first_name, last_name || '', email, hashedPassword, role, contact, home_address, birthday, req.user?.id || null]
      );

      const userId = result.insertId;

      // Create user preferences
      await query(
        `INSERT INTO user_preferences (user_id, email_notifications, lesson_updates, achievement_alerts)
         VALUES (?, 1, 1, 1)`,
        [userId]
      );

      // Create user XP if student
      if (role === 'student') {
        await query(
          `INSERT INTO user_xp (student_id, total_xp, current_level)
           VALUES (?, 0, 1)`,
          [userId]
        );
      }

      // Log activity
      await query(
        `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user?.id, 'CREATE', 'user', userId, `Created new user: ${username}`]
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user_id: userId,
          username,
          email,
          role
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'CREATE_USER_ERROR'
    });
  }
};

/**
 * PUT /api/admin/users/:userId
 * Update user
 */
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, first_name, last_name, email, role, contact, home_address, birthday } = req.body;

    // Check if user exists
    const [existingUser] = await query(
      'SELECT id FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId]
    );

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check for duplicate username/email (excluding current user)
    if (username || email) {
      const [duplicate] = await query(
        'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [username, email, userId]
      );

      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: 'Username or email already exists',
          code: 'DUPLICATE_USER'
        });
      }
    }

    // Build update query
    const updates = [];
    const params = [];

    if (username) {
      updates.push('username = ?');
      params.push(username);
    }
    if (first_name) {
      updates.push('first_name = ?');
      params.push(first_name);
    }
    if (last_name !== undefined) {
      updates.push('last_name = ?');
      params.push(last_name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }
    if (contact !== undefined) {
      updates.push('contact = ?');
      params.push(contact);
    }
    if (home_address !== undefined) {
      updates.push('home_address = ?');
      params.push(home_address);
    }
    if (birthday !== undefined) {
      updates.push('birthday = ?');
      params.push(birthday);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
        code: 'NO_UPDATES'
      });
    }

    updates.push('updated_at = NOW()');
    params.push(userId);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user?.id, 'UPDATE', 'user', userId, `Updated user #${userId}`]
    );

    // Fetch updated user
    const [updatedUser] = await query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'UPDATE_USER_ERROR'
    });
  }
};

/**
 * DELETE /api/admin/users/:userId
 * Soft delete user
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user?.id;

    // Check if user exists
    const [existingUser] = await query(
      'SELECT id, role FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId]
    );

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Prevent admin from deleting themselves
    if (userId == adminId) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete your own account',
        code: 'CANNOT_DELETE_SELF'
      });
    }

    // Soft delete
    await query(
      'UPDATE users SET deleted_at = NOW() WHERE id = ?',
      [userId]
    );

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description)
       VALUES (?, ?, ?, ?, ?)`,
      [adminId, 'DELETE', 'user', userId, `Deleted user #${userId}`]
    );

    res.json({
      success: true,
      message: 'User deleted successfully',
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'DELETE_USER_ERROR'
    });
  }
};

/**
 * PATCH /api/admin/users/:userId/restore
 * Restore soft-deleted user
 */
export const restoreUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if deleted user exists
    const [deletedUser] = await query(
      'SELECT id FROM users WHERE id = ? AND deleted_at IS NOT NULL',
      [userId]
    );

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: 'Deleted user not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Restore user
    await query(
      'UPDATE users SET deleted_at = NULL WHERE id = ?',
      [userId]
    );

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user?.id, 'RESTORE', 'user', userId, `Restored user #${userId}`]
    );

    res.json({
      success: true,
      message: 'User restored successfully',
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Restore user error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'RESTORE_USER_ERROR'
    });
  }
};

/**
 * PATCH /api/admin/users/:userId/toggle-status
 * Toggle user verified status
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const [user] = await query(
      'SELECT id, is_verified FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Toggle status
    const newStatus = !user.is_verified;
    await query(
      'UPDATE users SET is_verified = ? WHERE id = ?',
      [newStatus, userId]
    );

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user?.id, 'TOGGLE_STATUS', 'user', userId, `Changed user status to ${newStatus ? 'verified' : 'unverified'}`]
    );

    res.json({
      success: true,
      message: 'User status toggled successfully',
      data: {
        user_id: userId,
        is_verified: newStatus,
        status: newStatus ? 'active' : 'inactive'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'TOGGLE_STATUS_ERROR'
    });
  }
};

/**
 * GET /api/admin/users/export
 * Export users list (CSV/PDF)
 */
export const exportUsers = async (req, res) => {
  try {
    const { 
      search = '', 
      fromDate = null, 
      toDate = null,
      role = null,
      format = 'csv'
    } = req.query;

    // Build WHERE clause (same as getUsersList)
    let whereConditions = ['deleted_at IS NULL'];
    const params = [];

    if (search) {
      whereConditions.push('(username LIKE ? OR email LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (fromDate) {
      whereConditions.push('DATE(created_at) >= ?');
      params.push(fromDate);
    }

    if (toDate) {
      whereConditions.push('DATE(created_at) <= ?');
      params.push(toDate);
    }

    if (role && ['student', 'instructor', 'admin'].includes(role)) {
      whereConditions.push('role = ?');
      params.push(role);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get all matching users
    const users = await query(
      `SELECT 
        id, username, email, role, is_verified,
        DATE_FORMAT(created_at, '%Y-%m-%d') as registration_date,
        DATE_FORMAT(last_login, '%Y-%m-%d') as last_login
       FROM users
       WHERE ${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    if (format === 'csv') {
      // Format as CSV
      const headers = ['User ID', 'Username', 'Email', 'Role', 'Status', 'Registration Date', 'Last Login'];
      const csvContent = [
        headers.join(','),
        ...users.map(u => [
          u.id,
          u.username,
          u.email,
          u.role,
          u.is_verified ? 'Active' : 'Inactive',
          u.registration_date,
          u.last_login || 'Never'
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      // Return JSON for PDF generation on frontend
      res.json({
        success: true,
        data: users,
        meta: {
          timestamp: new Date().toISOString(),
          format: 'pdf',
          filename: `users_export_${new Date().toISOString().split('T')[0]}.pdf`
        }
      });
    }
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'EXPORT_ERROR'
    });
  }
};
