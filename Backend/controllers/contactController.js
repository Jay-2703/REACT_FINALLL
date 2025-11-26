import { query } from '../config/db.js';
import { notifyAdmins } from '../services/notificationService.js';
import emailService from '../services/emailService.js';

/**
 * Contact Controller
 * Handles contact form submissions
 */

/**
 * Submit contact form message
 */
export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    // Insert message into database
    const result = await query(
      `INSERT INTO contact_messages (name, email, message, created_at) 
       VALUES (?, ?, ?, NOW())`,
      [name, email, message]
    );

    console.log(`📧 New contact message from ${name} (${email})`);

    // Notify admins about new contact message
    try {
      await notifyAdmins(
        'contact_message',
        `New message from ${name}: "${message.substring(0, 50)}..."`,
        `/admin/messages`
      );
      console.log(`📬 Admin notification sent for new contact message`);
    } catch (notifError) {
      console.warn('Warning: Failed to notify admins:', notifError.message);
    }

    // Send confirmation email to user
    try {
      const emailContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #ffd700; margin-bottom: 30px; }
              .header h1 { margin: 0; font-size: 24px; color: #1b1b1b; }
              .content { padding: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>MixLab Studio</h1>
              </div>
              <div class="content">
                <p>Dear ${name},</p>
                <p>Thank you for reaching out to MixLab Studio! We've received your message and will get back to you as soon as possible.</p>
                <p><strong>Your Message:</strong><br/>${message}</p>
                <p>Best regards,<br/>MixLab Studio Team</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await emailService.sendEmail(
        email,
        'MixLab Studio - We received your message',
        emailContent
      );
      console.log(`✅ Confirmation email sent to ${email}`);
    } catch (emailError) {
      console.warn('Warning: Failed to send confirmation email:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit message. Please try again.'
    });
  }
};

/**
 * Get all contact messages (admin only)
 */
export const getContactMessages = async (req, res) => {
  try {
    const messages = await query(
      `SELECT * FROM contact_messages 
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

/**
 * Mark contact message as read
 */
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    await query(
      `UPDATE contact_messages SET is_read = TRUE WHERE id = ?`,
      [messageId]
    );

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
};

/**
 * Delete contact message
 */
export const deleteContactMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    await query(
      `DELETE FROM contact_messages WHERE id = ?`,
      [messageId]
    );

    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};
