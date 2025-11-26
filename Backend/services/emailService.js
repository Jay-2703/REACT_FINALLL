import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Brevo (formerly Sendinblue) Email Service
 * Handles sending OTP emails for registration and password reset
 */
class EmailService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.senderEmail = process.env.BREVO_SENDER_EMAIL ||'hiraya.11127@gmail.com';
    this.senderName = process.env.BREVO_SENDER_NAME || 'MixLab Studio';
    this.apiUrl = 'https://api.brevo.com/v3/smtp/email';
    
    if (!this.apiKey) {
      console.warn('⚠️  BREVO_API_KEY not set. Email functionality will be disabled.');
    }
  }

  /**
   * Send OTP email for registration
   * @param {string} email - Recipient email
   * @param {string} otp - 6-digit OTP code
   * @returns {Promise<boolean>}
   */
  async sendRegistrationOTP(email, otp) {
    const subject = 'Verify Your MixLab Studio Account';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { padding: 20px 0; text-align: center; border-bottom: 2px solid #ffd700; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 24px; color: #333; }
            .content { padding: 0; }
            .content p { color: #555; line-height: 1.8; margin: 15px 0; }
            .otp-box { text-align: center; margin: 30px 0; padding: 20px; }
            .otp-code { font-size: 36px; font-weight: bold; color: #ffd700; letter-spacing: 8px; font-family: monospace; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MixLab Studio</h1>
            </div>
            <div class="content">
              <p>Thank you for registering with MixLab Studio.</p>
              
              <p>To complete your registration, please use the verification code below:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              
              <p>This code will expire in 10 minutes.</p>
              
              <p>If you didn't request this, please ignore this email.</p>
              
              <p>Best regards,<br>The MixLab Studio Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail(email, subject, htmlContent);
  }

  /**
   * Send OTP email for password reset
   * @param {string} email - Recipient email
   * @param {string} otp - 6-digit OTP code
   * @returns {Promise<boolean>}
   */
  async sendPasswordResetOTP(email, otp) {
    const subject = 'Reset Your MixLab Studio Password';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { padding: 20px 0; text-align: center; border-bottom: 2px solid #ffd700; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 24px; color: #333; }
            .content { padding: 0; }
            .content p { color: #555; line-height: 1.8; margin: 15px 0; }
            .otp-box { text-align: center; margin: 30px 0; padding: 20px; }
            .otp-code { font-size: 36px; font-weight: bold; color: #ffd700; letter-spacing: 8px; font-family: monospace; }
            .warning { padding: 15px; margin: 20px 0; border-left: 3px solid #ffd700; background-color: #fffaf0; color: #555; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MixLab Studio</h1>
            </div>
            <div class="content">
              <p>We received a request to reset your password for your MixLab Studio account.</p>
              
              <p>Use the code below to proceed:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="warning">
                <strong>Security Notice:</strong> This code will expire in 10 minutes. If you didn't request a password reset, please ignore this email.
              </div>
              
              <p>Best regards,<br>The MixLab Studio Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail(email, subject, htmlContent);
  }

  /**
   * Send email via Brevo API
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} htmlContent - HTML email content
   * @returns {Promise<boolean>}
   */
  async sendEmail(to, subject, htmlContent) {
    if (!this.apiKey) {
      console.error('❌ Brevo API key not configured. Email not sent.');
      return false;
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          sender: {
            name: this.senderName,
            email: this.senderEmail
          },
          to: [
            {
              email: to
            }
          ],
          subject: subject,
          htmlContent: htmlContent
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        console.log(`✅ Email sent successfully to ${to}`);
        return true;
      } else {
        console.error('❌ Failed to send email:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending email:', error.response?.data || error.message);
      return false;
    }
  }
}

export default new EmailService();

