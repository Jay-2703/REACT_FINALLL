import db, { query } from '../config/db.js';
import bcrypt from 'bcryptjs';

/**
 * ============================================================================
 * PAYMENTS & BILLING CONTROLLER
 * ============================================================================
 * Manages all payment transactions, invoices, refunds, receipts, and exports
 * Database Tables: transactions, invoices, bookings, services, users
 */

// ============================================================================
// TEST ENDPOINT - Check database connection and data
// ============================================================================
export const testDatabase = async (req, res) => {
  try {
    const transactionCount = await query('SELECT COUNT(*) as count FROM transactions');
    const bookingCount = await query('SELECT COUNT(*) as count FROM bookings');
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    
    // Get sample transaction
    const sample = await query(`
      SELECT 
        t.transaction_id, t.transaction_reference, t.amount,
        b.booking_reference, u.first_name, u.last_name,
        s.service_name, inv.invoice_number
      FROM transactions t
      LEFT JOIN bookings b ON t.booking_id = b.booking_id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN services s ON b.service_id = s.service_id
      LEFT JOIN invoices inv ON t.invoice_id = inv.invoice_id
      LIMIT 1
    `);
    
    res.json({
      success: true,
      database: {
        transactions: transactionCount[0]?.count || 0,
        bookings: bookingCount[0]?.count || 0,
        users: userCount[0]?.count || 0
      },
      sampleTransaction: sample[0] || null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// 1. GET PAYMENTS LIST - Main transactions table with filters & search
// ============================================================================
export const getPayments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = 'all',
      service = 'all',
      sort = 'transaction_date',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build WHERE clauses
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Status filter - use exact DB values
    if (status !== 'all') {
      const statusMap = {
        'Success': 'completed',
        'Pending': 'pending',
        'Failed': 'failed',
        'Refunded': 'refunded'
      };
      const dbStatus = statusMap[status] || status.toLowerCase();
      whereClause += ` AND t.status = ?`;
      params.push(dbStatus);
    }

    // Service filter
    if (service !== 'all') {
      whereClause += ` AND s.service_name = ?`;
      params.push(service);
    }

    // Search filter
    if (search) {
      whereClause += ` AND (
        t.transaction_reference LIKE ? OR
        CONCAT(COALESCE(u1.first_name, u2.first_name, ''), ' ', COALESCE(u1.last_name, u2.last_name, '')) LIKE ? OR
        inv.invoice_number LIKE ? OR
        b.booking_reference LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // CORRECTED QUERY - Join users through BOTH t.user_id AND b.user_id with COALESCE fallback
    const sqlQuery = `
      SELECT 
        t.transaction_id,
        t.transaction_reference,
        t.amount,
        t.payment_method,
        t.status,
        t.transaction_date,
        t.completed_at,
        t.gateway_transaction_id,
        t.refunded_amount,
        t.refund_reason,
        t.refunded_at,
        b.booking_id,
        b.booking_reference,
        b.booking_date,
        COALESCE(t.user_id, b.user_id) as user_id,
        CONCAT(
          COALESCE(u1.first_name, u2.first_name, 'Unknown'), 
          ' ', 
          COALESCE(u1.last_name, u2.last_name, '')
        ) AS client_name,
        COALESCE(u1.email, u2.email) as email,
        COALESCE(u1.contact, u2.contact) as phone,
        s.service_id,
        s.service_name,
        inv.invoice_id,
        inv.invoice_number,
        COALESCE(inv.subtotal, 0) as subtotal,
        COALESCE(inv.tax_amount, 0) as tax_amount,
        COALESCE(inv.discount_amount, 0) as discount_amount,
        inv.total_amount,
        inv.status AS invoice_status
      FROM transactions t
      LEFT JOIN invoices inv ON t.invoice_id = inv.invoice_id
      LEFT JOIN bookings b ON t.booking_id = b.booking_id
      LEFT JOIN users u1 ON t.user_id = u1.id
      LEFT JOIN users u2 ON b.user_id = u2.id
      LEFT JOIN services s ON b.service_id = s.service_id
      ${whereClause}
      ORDER BY t.${sort} ${order}
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), offset);

    // Execute query
    const results = await query(sqlQuery, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total FROM transactions t
      LEFT JOIN invoices inv ON t.invoice_id = inv.invoice_id
      LEFT JOIN bookings b ON t.booking_id = b.booking_id
      LEFT JOIN users u1 ON t.user_id = u1.id
      LEFT JOIN users u2 ON b.user_id = u2.id
      LEFT JOIN services s ON b.service_id = s.service_id
      ${whereClause}
    `;
    
    const countResults = await query(countQuery, params.slice(0, params.length - 2));
    
    const total = countResults[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Status mapping
    const statusMap = {
      'completed': 'Success',
      'pending': 'Pending',
      'failed': 'Failed',
      'refunded': 'Refunded'
    };

    // DEBUG LOGGING
    console.log('📤 Sending response with', results.length, 'results');
    console.log('✅ Results is array:', Array.isArray(results));
    console.log('✅ Results[0] type:', typeof results[0]);
    console.log('✅ Results[0] is array:', Array.isArray(results[0]));
    if (results.length > 0) {
      if (Array.isArray(results[0])) {
        console.log('⚠️ ALERT: results[0] is an array! First item in that array:');
        console.log('🔍 FIRST RESULT FROM DB:', JSON.stringify(results[0][0], null, 2));
      } else {
        console.log('🔍 FIRST RESULT FROM DB:', JSON.stringify(results[0], null, 2));
      }
    }

    const mappedData = results.map((row, idx) => {
      const mapped = {
        id: row.transaction_id,
        payment_id: row.transaction_reference,
        booking_id: row.booking_reference || '',
        client_name: row.client_name || '',
        service_type: row.service_name || '',
        amount: parseFloat(row.amount) || 0,
        base_amount: parseFloat(row.subtotal) || 0,
        add_ons: parseFloat(row.tax_amount) || 0,
        payment_method: row.payment_method || '',
        status: statusMap[row.status] || row.status,
        transaction_date: row.transaction_date ? new Date(row.transaction_date).toISOString().split('T')[0] : '',
        invoice_number: row.invoice_number || '',
        gateway_response: row.gateway_transaction_id || '000'
      };
      if (idx === 0) {
        console.log('🔍 FIRST MAPPED DATA:', JSON.stringify(mapped, null, 2));
      }
      return mapped;
    });

    console.log('✨ Total mapped:', mappedData.length);

    res.json({
      success: true,
      data: mappedData,
      pagination: {
        current: parseInt(page),
        total: totalPages,
        perPage: parseInt(limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error in getPayments:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// ============================================================================
// 2. GET PAYMENT SUMMARY - KPI cards (Total Revenue, Pending, Failed, Refunded)
// ============================================================================
export const getPaymentSummary = async (req, res) => {
  try {
    const query = `
      SELECT 
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
        SUM(CASE WHEN status = 'refunded' THEN COALESCE(refunded_amount, amount) ELSE 0 END) as refunded_total,
        COUNT(DISTINCT user_id) as total_clients,
        COUNT(*) as total_transactions
      FROM transactions
    `;

    const results = await query(query);
    const data = results[0];
    
    res.json({
      success: true,
      summary: {
        totalRevenue: data.total_revenue || 0,
        pending: data.pending_amount || 0,
        failed: data.failed_count || 0,
        refunded: data.refunded_total || 0,
        totalClients: data.total_clients || 0,
        totalTransactions: data.total_transactions || 0
      }
    });
  } catch (error) {
    console.error('Error in getPaymentSummary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ============================================================================
// 3. GET SINGLE PAYMENT DETAILS
// ============================================================================
export const getPaymentDetails = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const query = `
      SELECT 
        t.*,
        b.booking_reference,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.duration_minutes,
        u.first_name,
        u.last_name,
        u.email,
        u.contact,
        s.service_name,
        inv.invoice_number,
        inv.issue_date,
        inv.due_date,
        inv.subtotal,
        inv.tax_amount,
        inv.discount_amount,
        inv.total_amount
      FROM transactions t
      LEFT JOIN invoices inv ON t.invoice_id = inv.invoice_id
      LEFT JOIN bookings b ON t.booking_id = b.booking_id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN services s ON b.service_id = s.service_id
      WHERE t.transaction_id = ?
    `;

    const results = await query(query, [transactionId]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const transaction = results[0];
    res.json({
      success: true,
      data: {
        id: transaction.transaction_id,
        reference: transaction.transaction_reference,
        amount: transaction.amount,
        method: transaction.payment_method,
        status: transaction.status,
        transactionDate: transaction.transaction_date,
        completedAt: transaction.completed_at,
        gatewayId: transaction.gateway_transaction_id,
        gatewayResponse: transaction.gateway_response,
        refundedAmount: transaction.refunded_amount,
        refundReason: transaction.refund_reason,
        refundedAt: transaction.refunded_at,
        client: {
          id: transaction.user_id,
          name: `${transaction.first_name} ${transaction.last_name}`,
          email: transaction.email,
          phone: transaction.contact
        },
        booking: {
          id: transaction.booking_id,
          reference: transaction.booking_reference,
          date: transaction.booking_date,
          startTime: transaction.start_time,
          endTime: transaction.end_time,
          duration: transaction.duration_minutes,
          service: transaction.service_name
        },
        invoice: {
          id: transaction.invoice_id,
          number: transaction.invoice_number,
          issueDate: transaction.issue_date,
          dueDate: transaction.due_date,
          subtotal: transaction.subtotal,
          tax: transaction.tax_amount,
          discount: transaction.discount_amount,
          total: transaction.total_amount
        }
      }
    });
  } catch (error) {
    console.error('Error in getPaymentDetails:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ============================================================================
// 4. PROCESS REFUND
// ============================================================================
export const processRefund = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { amount, reason } = req.body;

    if (!amount || !reason) {
      return res.status(400).json({ error: 'Amount and reason required' });
    }

    // Get transaction details
    const getQuery = `SELECT * FROM transactions WHERE transaction_id = ?`;
    const results = await query(getQuery, [transactionId]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = results[0];

    // Validate: can only refund completed transactions
    if (transaction.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed transactions can be refunded' });
    }

    // Validate: refund amount cannot exceed transaction amount
    if (amount > transaction.amount) {
      return res.status(400).json({ error: 'Refund amount exceeds transaction amount' });
    }

    // Update transaction status
    const updateQuery = `
      UPDATE transactions 
      SET status = 'refunded', 
          refunded_amount = ?,
          refund_reason = ?,
          refunded_at = NOW(),
          updated_at = NOW()
      WHERE transaction_id = ?
    `;

    await query(updateQuery, [amount, reason, transactionId]);

    // Update related invoice
    const invoiceUpdateQuery = `
      UPDATE invoices 
      SET status = 'refunded',
          updated_at = NOW()
      WHERE invoice_id = ?
    `;

    await query(invoiceUpdateQuery, [transaction.invoice_id]);

    // Log activity
    const logQuery = `
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, metadata)
      VALUES (?, 'process_refund', 'transaction', ?, ?, ?)
    `;

    const metadata = JSON.stringify({
      amount,
      reason,
      previousStatus: transaction.status,
      newStatus: 'refunded'
    });

    await query(logQuery, [req.user?.id || null, transactionId, `Refund processed: ₱${amount}`, metadata]);

    // Fetch updated transaction for response
    const fetchResults = await query(getQuery, [transactionId]);

    res.json({
      success: true,
      message: `Refund of ₱${amount} processed successfully`,
      data: {
        id: fetchResults[0].transaction_id,
        status: fetchResults[0].status,
        refundedAmount: fetchResults[0].refunded_amount,
        refundedAt: fetchResults[0].refunded_at
      }
    });
  } catch (error) {
    console.error('Error in processRefund:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ============================================================================
// 5. MARK PAYMENT AS PAID (for pending transactions)
// ============================================================================
export const markAsPaid = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const getQuery = `SELECT * FROM transactions WHERE transaction_id = ?`;
    const results = await query(getQuery, [transactionId]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = results[0];

    // Only pending transactions can be marked paid
    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending transactions can be marked paid' });
    }

    // Update transaction
    const updateQuery = `
      UPDATE transactions 
      SET status = 'completed', 
          completed_at = NOW(),
          updated_at = NOW()
      WHERE transaction_id = ?
    `;

    await query(updateQuery, [transactionId]);

    // Update invoice
    const invoiceUpdateQuery = `
      UPDATE invoices 
      SET status = 'paid',
          updated_at = NOW()
      WHERE invoice_id = ?
    `;

    await query(invoiceUpdateQuery, [transaction.invoice_id]);

    // Log activity
    const logQuery = `
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description)
      VALUES (?, 'mark_payment_paid', 'transaction', ?, 'Payment marked as completed')
    `;

    await query(logQuery, [req.user?.id || null, transactionId]);

    res.json({
      success: true,
      message: 'Payment marked as paid',
      data: {
        id: transaction.transaction_id,
        status: 'completed',
        completedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error in markAsPaid:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ============================================================================
// 6. SEND RECEIPT EMAIL
// ============================================================================
export const sendReceipt = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const query = `
      SELECT 
        t.*,
        b.booking_reference,
        u.email,
        u.first_name,
        s.service_name,
        inv.invoice_number,
        inv.total_amount
      FROM transactions t
      LEFT JOIN invoices inv ON t.invoice_id = inv.invoice_id
      LEFT JOIN bookings b ON t.booking_id = b.booking_id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN services s ON b.service_id = s.service_id
      WHERE t.transaction_id = ?
    `;

    const results = await query(query, [transactionId]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = results[0];

    // TODO: Implement email sending using nodemailer or similar
    // For now, create notification record

    const notificationQuery = `
      INSERT INTO notifications (user_id, notification_type, title, message, related_entity_type, related_entity_id, sent_via_email)
      VALUES (?, 'payment_received', 'Payment Receipt', ?, 'transaction', ?, 1)
    `;

    const message = `Your payment of ₱${transaction.amount} for ${transaction.service_name} has been processed successfully. Receipt reference: ${transaction.transaction_reference}`;

    await query(notificationQuery, [transaction.user_id, message, transactionId]);

    // Log activity
    const logQuery = `
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description)
      VALUES (?, 'send_receipt', 'transaction', ?, 'Receipt sent to ${transaction.email}')
    `;

    await query(logQuery, [req.user?.id || null, transactionId]);

    res.json({
      success: true,
      message: `Receipt sent to ${transaction.email}`
    });
  } catch (error) {
    console.error('Error in sendReceipt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ============================================================================
// 7. DELETE/VOID TRANSACTION
// ============================================================================
export const deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const getQuery = `SELECT * FROM transactions WHERE transaction_id = ?`;
    const results = await query(getQuery, [transactionId]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = results[0];

    // Only allow deletion of failed or cancelled transactions
    if (!['failed', 'cancelled'].includes(transaction.status)) {
      return res.status(400).json({ error: 'Only failed or cancelled transactions can be deleted' });
    }

    // Soft delete
    const deleteQuery = `
      UPDATE transactions 
      SET status = 'cancelled',
          updated_at = NOW()
      WHERE transaction_id = ?
    `;

    await query(deleteQuery, [transactionId]);

    // Log activity
    const logQuery = `
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description)
      VALUES (?, 'delete_transaction', 'transaction', ?, 'Transaction cancelled/deleted')
    `;

    await query(logQuery, [req.user?.id || null, transactionId]);

    res.json({
      success: true,
      message: 'Transaction deleted',
      data: {
        id: transaction.transaction_id,
        status: 'cancelled'
      }
    });
  } catch (error) {
    console.error('Error in deleteTransaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ============================================================================
// 8. EXPORT PAYMENTS (CSV, Excel, PDF)
// ============================================================================
export const exportPayments = async (req, res) => {
  try {
    const { format = 'csv', status = 'all', service = 'all', search = '' } = req.query;

    // Build query same as getPayments but without pagination
    let whereClause = 'WHERE 1=1';
    let params = [];

    if (status !== 'all') {
      whereClause += ` AND t.status = ?`;
      params.push(status);
    }

    if (service !== 'all') {
      whereClause += ` AND s.service_name = ?`;
      params.push(service);
    }

    if (search) {
      whereClause += ` AND (
        t.transaction_reference LIKE ? OR
        CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR
        inv.invoice_number LIKE ? OR
        b.booking_reference LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const query = `
      SELECT 
        t.transaction_reference,
        b.booking_reference,
        CONCAT(u.first_name, ' ', u.last_name) AS client_name,
        s.service_name,
        t.amount,
        inv.subtotal,
        inv.tax_amount,
        t.payment_method,
        t.status,
        t.transaction_date
      FROM transactions t
      LEFT JOIN invoices inv ON t.invoice_id = inv.invoice_id
      LEFT JOIN bookings b ON t.booking_id = b.booking_id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN services s ON b.service_id = s.service_id
      ${whereClause}
      ORDER BY t.transaction_date DESC
    `;

    const results = await query(query, params);

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Payment ID', 'Booking ID', 'Client Name', 'Service Type', 'Amount', 'Base', 'Tax', 'Method', 'Status', 'Date'];
      const rows = results.map(r => [
        r.transaction_reference,
        r.booking_reference,
        r.client_name,
        r.service_name,
        r.amount,
        r.subtotal,
        r.tax_amount,
        r.payment_method,
        r.status,
        new Date(r.transaction_date).toISOString().split('T')[0]
      ]);

      const csv = [headers, ...rows].map(row => 
        row.map(cell => `"${cell || ''}"`).join(',')
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=payments_export.csv');
      res.send(csv);
    } else {
      // For Excel/PDF, return JSON that frontend can process
      res.json({
        success: true,
        format,
        data: results,
        message: 'Export data ready - frontend should handle Excel/PDF generation'
      });
    }
  } catch (error) {
    console.error('Error in exportPayments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ============================================================================
// 9. BULK ACTIONS
// ============================================================================
export const bulkAction = async (req, res) => {
  try {
    const { action, transactionIds } = req.body;

    if (!action || !transactionIds || !Array.isArray(transactionIds)) {
      return res.status(400).json({ error: 'Action and transaction IDs required' });
    }

    const placeholders = transactionIds.map(() => '?').join(',');

    if (action === 'mark_paid') {
      const updateQuery = `
        UPDATE transactions 
        SET status = 'completed', 
            completed_at = NOW(),
            updated_at = NOW()
        WHERE transaction_id IN (${placeholders}) AND status = 'pending'
      `;

      const result = await query(updateQuery, transactionIds);

      // Log activity
      const logQuery = `
        INSERT INTO activity_logs (user_id, action, entity_type, description, metadata)
        VALUES (?, 'bulk_mark_paid', 'transaction', 'Bulk marked transactions as paid', ?)
      `;

      await query(logQuery, [req.user?.id || null, JSON.stringify({ count: result.affectedRows })]);

      res.json({
        success: true,
        message: `${result.affectedRows} transactions marked as paid`,
        processed: result.affectedRows
      });

    } else if (action === 'send_receipts') {
      // Send receipts to all selected transactions
      for (const id of transactionIds) {
        const query = `
          INSERT INTO notifications (user_id, notification_type, title, message, related_entity_type, related_entity_id, sent_via_email)
          SELECT b.user_id, 'payment_received', 'Payment Receipt', 'Your receipt has been sent', 'transaction', t.transaction_id, 1
          FROM transactions t
          LEFT JOIN bookings b ON t.booking_id = b.booking_id
          WHERE t.transaction_id = ?
        `;
        try {
          await query(query, [id]);
        } catch (notifErr) {
          console.error('Notification error:', notifErr);
        }
      }

      res.json({
        success: true,
        message: `Receipts sent for ${transactionIds.length} transactions`,
        processed: transactionIds.length
      });

    } else if (action === 'delete') {
      const deleteQuery = `
        UPDATE transactions 
        SET status = 'cancelled',
            updated_at = NOW()
        WHERE transaction_id IN (${placeholders}) AND status IN ('failed', 'cancelled')
      `;

      const result = await query(deleteQuery, transactionIds);

      res.json({
        success: true,
        message: `${result.affectedRows} transactions deleted`,
        processed: result.affectedRows
      });

    } else {
      res.status(400).json({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error in bulkAction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ============================================================================
// 10. GET SERVICES LIST (for filter dropdown)
// ============================================================================
export const getServices = async (req, res) => {
  try {
    const query = `SELECT service_id, service_name FROM services WHERE is_active = 1 ORDER BY service_name`;

    const results = await query(query);

    res.json({
      success: true,
      data: results.map(s => ({
        id: s.service_id,
        name: s.service_name
      }))
    });
  } catch (error) {
    console.error('Error in getServices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ============================================================================
// 11. GET INVOICE DETAILS
// ============================================================================
export const getInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const query = `
      SELECT 
        inv.*,
        b.booking_reference,
        b.booking_date,
        u.first_name,
        u.last_name,
        u.email,
        u.contact,
        s.service_name
      FROM invoices inv
      LEFT JOIN bookings b ON inv.booking_id = b.booking_id
      LEFT JOIN users u ON inv.user_id = u.id
      LEFT JOIN services s ON b.service_id = s.service_id
      WHERE inv.invoice_id = ?
    `;

    const results = await query(query, [invoiceId]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = results[0];
    res.json({
      success: true,
      data: {
        id: invoice.invoice_id,
        number: invoice.invoice_number,
        issueDate: invoice.issue_date,
        dueDate: invoice.due_date,
        status: invoice.status,
        client: {
          name: `${invoice.first_name} ${invoice.last_name}`,
          email: invoice.email,
          phone: invoice.contact
        },
        booking: {
          reference: invoice.booking_reference,
          date: invoice.booking_date,
          service: invoice.service_name
        },
        items: [
          {
            description: invoice.service_name || 'Service',
            amount: invoice.subtotal
          }
        ],
        subtotal: invoice.subtotal,
        tax: invoice.tax_amount,
        discount: invoice.discount_amount,
        total: invoice.total_amount,
        notes: invoice.notes
      }
    });
  } catch (error) {
    console.error('Error in getInvoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ============================================================================
// 12. CREATE TRANSACTION (for manual payment entry)
// ============================================================================
export const createTransaction = async (req, res) => {
  try {
    const { 
      invoiceId, 
      bookingId, 
      amount, 
      paymentMethod, 
      status = 'pending',
      gatewayTransactionId = null
    } = req.body;

    if (!amount || !paymentMethod) {
      return res.status(400).json({ error: 'Amount and payment method required' });
    }

    // Generate unique transaction reference
    const transactionRef = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const query = `
      INSERT INTO transactions (
        transaction_reference,
        invoice_id,
        booking_id,
        user_id,
        amount,
        payment_method,
        status,
        gateway_transaction_id,
        transaction_date
      ) SELECT ?, ?, ?, b.user_id, ?, ?, ?, ?, NOW()
      FROM bookings b
      WHERE b.booking_id = ?
    `;

    const result = await query(query, [transactionRef, invoiceId, bookingId, amount, paymentMethod, status, gatewayTransactionId, bookingId]);

    // Log activity
    const logQuery = `
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description)
      VALUES (?, 'create_transaction', 'transaction', ?, 'Manual transaction created: ${transactionRef}')
    `;

    await query(logQuery, [req.user?.id || null, result.insertId]);

    res.json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        id: result.insertId,
        reference: transactionRef,
        status
      }
    });
  } catch (error) {
    console.error('Error in createTransaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ============================================================================
// 13. PAYMENT STATISTICS / ANALYTICS
// ============================================================================
export const getPaymentStats = async (req, res) => {
  try {
    const { startDate = null, endDate = null } = req.query;

    let dateClause = '';
    let params = [];

    if (startDate && endDate) {
      dateClause = ' AND DATE(t.transaction_date) BETWEEN ? AND ?';
      params = [startDate, endDate];
    }

    const query = `
      SELECT 
        DATE(t.transaction_date) AS date,
        COUNT(*) AS total_transactions,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
        SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN t.status = 'failed' THEN 1 ELSE 0 END) AS failed_count,
        SUM(CASE WHEN t.status = 'completed' THEN t.amount ELSE 0 END) AS completed_revenue,
        SUM(CASE WHEN t.status = 'refunded' THEN COALESCE(t.refunded_amount, t.amount) ELSE 0 END) AS refunded_amount,
        COUNT(DISTINCT t.payment_method) AS methods_used
      FROM transactions t
      WHERE 1=1 ${dateClause}
      GROUP BY DATE(t.transaction_date)
      ORDER BY date DESC
    `;

    const results = await query(query, params);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error in getPaymentStats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
