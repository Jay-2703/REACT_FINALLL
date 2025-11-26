import { query } from '../config/db.js';
import { notifyAdmins } from '../services/notificationService.js';
import bcrypt from 'bcryptjs';

/**
 * Get all instructors with statistics
 * GET /api/admin/instructors
 */
export const getInstructors = async (req, res) => {
  try {
    const {
      search = '',
      specialization = 'all',
      availability = 'all',
      page = 1,
      limit = 10,
      sort = 'name',
      order = 'asc'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE u.role = "instructor" AND u.deleted_at IS NULL';
    const params = [];

    // Search filter
    if (search) {
      whereClause += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.username LIKE ? OR u.specialization LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Specialization filter
    if (specialization !== 'all') {
      whereClause += ' AND u.specialization = ?';
      params.push(specialization);
    }

    // Availability filter
    if (availability === 'available') {
      whereClause += ' AND u.available_for_booking = TRUE';
    } else if (availability === 'on_leave') {
      whereClause += ' AND u.available_for_booking = FALSE';
    }

    // Valid sort columns
    const validSortColumns = ['name', 'email', 'specialization', 'total_sessions', 'upcoming_sessions'];
    const sortColumn = validSortColumns.includes(sort) ? sort : 'name';
    const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM users u ${whereClause}`;
    const [countResult] = await query(countQuery, params);
    const total = countResult[0]?.count || 0;

    // Get instructors with statistics
    const sql = `
      SELECT
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        u.email,
        u.contact,
        u.specialization,
        u.years_experience,
        u.certifications,
        u.bio,
        u.hourly_rate,
        u.available_for_booking,
        u.created_at,
        u.updated_at,
        COALESCE(COUNT(DISTINCT CASE WHEN b.status IN ('confirmed', 'completed') THEN b.booking_id END), 0) as total_sessions,
        COALESCE(COUNT(DISTINCT CASE WHEN b.booking_date >= CURDATE() AND b.status = 'confirmed' THEN b.booking_id END), 0) as upcoming_sessions,
        COALESCE(SUM(CASE WHEN b.status = 'completed' THEN i.total_amount ELSE 0 END), 0) as total_revenue
      FROM users u
      LEFT JOIN bookings b ON u.id = b.instructor_id
      LEFT JOIN invoices i ON b.booking_id = i.booking_id
      ${whereClause}
      GROUP BY u.id
      ORDER BY 
        CASE
          WHEN ? = 'name' THEN CONCAT(u.first_name, ' ', u.last_name)
          WHEN ? = 'email' THEN u.email
          WHEN ? = 'specialization' THEN u.specialization
          WHEN ? = 'total_sessions' THEN COALESCE(COUNT(DISTINCT CASE WHEN b.status IN ('confirmed', 'completed') THEN b.booking_id END), 0)
          WHEN ? = 'upcoming_sessions' THEN COALESCE(COUNT(DISTINCT CASE WHEN b.booking_date >= CURDATE() AND b.status = 'confirmed' THEN b.booking_id END), 0)
          ELSE CONCAT(u.first_name, ' ', u.last_name)
        END ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const sortParams = [
      ...params,
      sortColumn, sortColumn, sortColumn, sortColumn, sortColumn,
      parseInt(limit), parseInt(offset)
    ];

    const instructors = await query(sql, sortParams);

    res.json({
      success: true,
      instructors: instructors.map(instr => ({
        id: instr.id,
        name: `${instr.first_name} ${instr.last_name}`,
        firstName: instr.first_name,
        lastName: instr.last_name,
        email: instr.email,
        phone: instr.contact,
        specialization: instr.specialization,
        yearsExperience: instr.years_experience,
        certifications: instr.certifications,
        bio: instr.bio,
        hourlyRate: parseFloat(instr.hourly_rate),
        available: instr.available_for_booking,
        totalSessions: parseInt(instr.total_sessions),
        upcomingSessions: parseInt(instr.upcoming_sessions),
        totalRevenue: parseFloat(instr.total_revenue),
        createdAt: instr.created_at,
        updatedAt: instr.updated_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get instructors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructors'
    });
  }
};

/**
 * Get instructor statistics (summary cards)
 * GET /api/admin/instructors/stats
 */
export const getInstructorStats = async (req, res) => {
  try {
    // Total instructors
    const [totalResult] = await query(
      'SELECT COUNT(*) as count FROM users WHERE role = "instructor" AND deleted_at IS NULL'
    );
    const totalInstructors = totalResult[0]?.count || 0;

    // Active instructors
    const [activeResult] = await query(
      'SELECT COUNT(*) as count FROM users WHERE role = "instructor" AND available_for_booking = TRUE AND deleted_at IS NULL'
    );
    const activeInstructors = activeResult[0]?.count || 0;

    // Client retention (repeat bookings in last 6 months)
    const [retentionResult] = await query(`
      SELECT 
        COUNT(DISTINCT user_id) as repeat_customers,
        (SELECT COUNT(DISTINCT user_id) FROM bookings WHERE booking_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)) as total_customers
      FROM bookings
      WHERE booking_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(booking_date, '%Y-%m')
    `);

    let clientRetention = 0;
    if (retentionResult && retentionResult.length > 0) {
      const repeatCustomers = retentionResult.reduce((sum, r) => sum + (r.repeat_customers || 0), 0);
      const totalCustomers = retentionResult[0]?.total_customers || 0;
      clientRetention = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;
    }

    res.json({
      success: true,
      stats: {
        totalInstructors,
        activeInstructors,
        clientRetention
      }
    });
  } catch (error) {
    console.error('Get instructor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

/**
 * Get single instructor with full details
 * GET /api/admin/instructors/:id
 */
export const getInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    const [instructors] = await query(`
      SELECT
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        u.email,
        u.contact,
        u.birthday,
        u.home_address,
        u.specialization,
        u.years_experience,
        u.certifications,
        u.bio,
        u.hourly_rate,
        u.available_for_booking,
        u.created_at,
        u.updated_at,
        COALESCE(COUNT(DISTINCT b.booking_id), 0) as total_sessions
      FROM users u
      LEFT JOIN bookings b ON u.id = b.instructor_id AND (b.status = 'completed' OR b.status = 'confirmed')
      WHERE u.id = ? AND u.role = 'instructor'
      GROUP BY u.id
    `, [id]);

    if (!instructors || instructors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    const instr = instructors[0];

    res.json({
      success: true,
      instructor: {
        id: instr.id,
        username: instr.username,
        firstName: instr.first_name,
        lastName: instr.last_name,
        email: instr.email,
        phone: instr.contact,
        birthday: instr.birthday,
        address: instr.home_address,
        specialization: instr.specialization,
        yearsExperience: instr.years_experience,
        certifications: instr.certifications,
        bio: instr.bio,
        hourlyRate: parseFloat(instr.hourly_rate),
        available: instr.available_for_booking,
        totalSessions: parseInt(instr.total_sessions),
        createdAt: instr.created_at,
        updatedAt: instr.updated_at
      }
    });
  } catch (error) {
    console.error('Get instructor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructor'
    });
  }
};

/**
 * Create new instructor
 * POST /api/admin/instructors
 */
export const createInstructor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      specialization,
      yearsExperience = 0,
      certifications,
      bio,
      hourlyRate,
      availableForBooking = true,
      password = 'tempPassword123!'
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !specialization) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: firstName, lastName, email, specialization'
      });
    }

    // Check email uniqueness
    const [existingEmail] = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingEmail && existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert instructor
    const [result] = await query(`
      INSERT INTO users 
      (username, first_name, last_name, email, contact, specialization, years_experience, certifications, bio, hourly_rate, available_for_booking, hashed_password, role, is_verified, email_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'instructor', true, true)
    `, [
      email.split('@')[0], // Generate username from email
      firstName,
      lastName,
      email,
      phone,
      specialization,
      yearsExperience,
      certifications,
      bio,
      hourlyRate || 0,
      availableForBooking,
      hashedPassword
    ]);

    const instructorId = result.insertId;

    // Create user preferences
    await query(
      'INSERT INTO user_preferences (user_id, email_notifications, lesson_updates, achievement_alerts) VALUES (?, true, true, true)',
      [instructorId]
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, success) VALUES (?, ?, ?, ?, ?, true)',
      [req.user?.id || null, 'created_instructor', 'instructor', instructorId, `Created instructor: ${firstName} ${lastName}`]
    );

    res.status(201).json({
      success: true,
      message: 'Instructor created successfully',
      instructor: {
        id: instructorId,
        firstName,
        lastName,
        email,
        phone,
        specialization,
        yearsExperience,
        certifications,
        bio,
        hourlyRate,
        available: availableForBooking
      }
    });
  } catch (error) {
    console.error('Create instructor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create instructor'
    });
  }
};

/**
 * Update instructor
 * PUT /api/admin/instructors/:id
 */
export const updateInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      specialization,
      yearsExperience,
      certifications,
      bio,
      hourlyRate
    } = req.body;

    // Verify instructor exists
    const [existing] = await query(
      'SELECT id FROM users WHERE id = ? AND role = "instructor"',
      [id]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    // Update instructor
    await query(`
      UPDATE users 
      SET 
        first_name = ?,
        last_name = ?,
        contact = ?,
        specialization = ?,
        years_experience = ?,
        certifications = ?,
        bio = ?,
        hourly_rate = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      firstName,
      lastName,
      phone,
      specialization,
      yearsExperience,
      certifications,
      bio,
      hourlyRate,
      id
    ]);

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, success) VALUES (?, ?, ?, ?, ?, true)',
      [req.user?.id || null, 'updated_instructor', 'instructor', id, `Updated instructor: ${firstName} ${lastName}`]
    );

    res.json({
      success: true,
      message: 'Instructor updated successfully'
    });
  } catch (error) {
    console.error('Update instructor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update instructor'
    });
  }
};

/**
 * Toggle instructor availability
 * PATCH /api/admin/instructors/:id/availability
 */
export const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    // Get current availability status
    const [instructor] = await query(
      'SELECT available_for_booking FROM users WHERE id = ? AND role = "instructor"',
      [id]
    );

    if (!instructor || instructor.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    const currentStatus = instructor[0].available_for_booking;
    const newStatus = !currentStatus;

    // Update availability
    await query(
      'UPDATE users SET available_for_booking = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, id]
    );

    // If deactivating, cancel upcoming bookings
    if (!newStatus) {
      await query(`
        UPDATE bookings 
        SET status = 'cancelled', cancelled_at = NOW()
        WHERE instructor_id = ? AND booking_date >= CURDATE() AND status = 'confirmed'
      `, [id]);
    }

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, success) VALUES (?, ?, ?, ?, ?, true)',
      [req.user?.id || null, 'toggled_availability', 'instructor', id, `Availability changed to: ${newStatus ? 'Available' : 'On Leave'}`]
    );

    res.json({
      success: true,
      message: `Instructor availability updated to ${newStatus ? 'Available' : 'On Leave'}`,
      available: newStatus
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle availability'
    });
  }
};

/**
 * Delete instructor (soft delete)
 * DELETE /api/admin/instructors/:id
 */
export const deleteInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if instructor has upcoming bookings
    const [upcomingBookings] = await query(
      'SELECT COUNT(*) as count FROM bookings WHERE instructor_id = ? AND booking_date >= CURDATE() AND status = "confirmed"',
      [id]
    );

    const hasUpcoming = upcomingBookings[0]?.count > 0;

    if (hasUpcoming) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete instructor with upcoming bookings. Please reschedule or cancel them first.'
      });
    }

    // Soft delete
    await query(
      'UPDATE users SET deleted_at = NOW(), available_for_booking = FALSE WHERE id = ?',
      [id]
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, success) VALUES (?, ?, ?, ?, ?, true)',
      [req.user?.id || null, 'deleted_instructor', 'instructor', id, 'Deleted instructor']
    );

    res.json({
      success: true,
      message: 'Instructor deleted successfully'
    });
  } catch (error) {
    console.error('Delete instructor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete instructor'
    });
  }
};

/**
 * Get instructor schedule/availability
 * GET /api/admin/instructors/:id/schedule
 */
export const getInstructorSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    // Get recurring availability
    const [availability] = await query(`
      SELECT * FROM instructor_availability 
      WHERE instructor_id = ? 
      ORDER BY day_of_week ASC, start_time ASC
    `, [id]);

    // Get upcoming bookings (next 30 days)
    const [bookings] = await query(`
      SELECT 
        b.booking_id,
        b.booking_reference,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.status,
        u.first_name,
        u.last_name,
        s.service_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.service_id
      WHERE b.instructor_id = ? AND b.booking_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      ORDER BY b.booking_date ASC, b.start_time ASC
    `, [id]);

    res.json({
      success: true,
      availability: availability.map(a => ({
        id: a.availability_id,
        dayOfWeek: a.day_of_week,
        startTime: a.start_time,
        endTime: a.end_time,
        isRecurring: a.is_recurring,
        specificDate: a.specific_date,
        isAvailable: a.is_available
      })),
      upcomingBookings: bookings.map(b => ({
        id: b.booking_id,
        reference: b.booking_reference,
        date: b.booking_date,
        startTime: b.start_time,
        endTime: b.end_time,
        status: b.status,
        studentName: `${b.first_name} ${b.last_name}`,
        service: b.service_name
      }))
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule'
    });
  }
};

/**
 * Get instructor bookings
 * GET /api/admin/instructors/:id/bookings
 */
export const getInstructorBookings = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE b.instructor_id = ?';
    const params = [id];

    if (status !== 'all') {
      whereClause += ' AND b.status = ?';
      params.push(status);
    }

    // Get total count
    const [countResult] = await query(
      `SELECT COUNT(*) as count FROM bookings b ${whereClause}`,
      params
    );
    const total = countResult[0]?.count || 0;

    // Get bookings
    const [bookings] = await query(`
      SELECT
        b.booking_id,
        b.booking_reference,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.duration_minutes,
        b.status,
        b.room_location,
        u.first_name,
        u.last_name,
        s.service_name,
        s.price,
        i.total_amount
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.service_id
      LEFT JOIN invoices i ON b.booking_id = i.booking_id
      ${whereClause}
      ORDER BY b.booking_date DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      bookings: bookings.map(b => ({
        id: b.booking_id,
        reference: b.booking_reference,
        date: b.booking_date,
        startTime: b.start_time,
        endTime: b.end_time,
        duration: b.duration_minutes,
        status: b.status,
        location: b.room_location,
        studentName: `${b.first_name} ${b.last_name}`,
        service: b.service_name,
        servicePrice: parseFloat(b.price),
        totalAmount: parseFloat(b.total_amount) || 0
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

/**
 * Export instructors to CSV/Excel
 * GET /api/admin/instructors/export
 */
export const exportInstructors = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;

    const [instructors] = await query(`
      SELECT
        u.id,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        u.email,
        u.contact,
        u.specialization,
        u.years_experience,
        u.hourly_rate,
        u.available_for_booking,
        COUNT(DISTINCT b.booking_id) as total_sessions
      FROM users u
      LEFT JOIN bookings b ON u.id = b.instructor_id AND b.status IN ('confirmed', 'completed')
      WHERE u.role = 'instructor' AND u.deleted_at IS NULL
      GROUP BY u.id
      ORDER BY u.first_name, u.last_name
    `);

    if (format === 'csv') {
      const csv = [
        ['ID', 'Name', 'Email', 'Phone', 'Specialization', 'Years Experience', 'Hourly Rate', 'Available', 'Total Sessions'],
        ...instructors.map(i => [
          i.id,
          i.name,
          i.email,
          i.contact,
          i.specialization,
          i.years_experience,
          i.hourly_rate,
          i.available_for_booking ? 'Yes' : 'No',
          i.total_sessions
        ])
      ].map(row => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="instructors.csv"');
      res.send(csv);
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format. Use csv or excel.'
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export instructors'
    });
  }
};

/**
 * Bulk actions on instructors
 * POST /api/admin/instructors/bulk-action
 */
export const bulkAction = async (req, res) => {
  try {
    const { action, ids } = req.body;

    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing action or ids array'
      });
    }

    let successful = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        if (action === 'deactivate') {
          await query(
            'UPDATE users SET available_for_booking = FALSE, updated_at = NOW() WHERE id = ?',
            [id]
          );
          successful++;
        } else if (action === 'activate') {
          await query(
            'UPDATE users SET available_for_booking = TRUE, updated_at = NOW() WHERE id = ?',
            [id]
          );
          successful++;
        } else if (action === 'delete') {
          await query(
            'UPDATE users SET deleted_at = NOW(), available_for_booking = FALSE WHERE id = ?',
            [id]
          );
          successful++;
        }
      } catch (err) {
        failed++;
      }
    }

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, entity_type, description, success) VALUES (?, ?, ?, ?, true)',
      [req.user?.id || null, `bulk_${action}`, 'instructor', `Bulk ${action}: ${successful} successful, ${failed} failed`]
    );

    res.json({
      success: true,
      message: `Bulk action completed: ${successful} successful, ${failed} failed`,
      summary: { successful, failed }
    });
  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk action'
    });
  }
};
