import { query } from '../config/db.js';
import { notifyUser } from './notificationService.js';
import schedule from 'node-schedule';

/**
 * Reminder Service
 * Handles scheduling of booking reminders
 */

const scheduledReminders = new Map(); // Track scheduled jobs

/**
 * Schedule booking reminders (1 day and 1 hour before)
 * @param {number} bookingId - Booking ID
 * @param {number} userId - User ID
 * @param {string} bookingDate - Booking date (YYYY-MM-DD)
 * @param {string} startTime - Start time (HH:MM:SS)
 * @param {string} serviceName - Service name for notification
 * @param {string} bookingReference - Booking reference (e.g., REF-xxxxx)
 */
export async function scheduleBookingReminders(bookingId, userId, bookingDate, startTime, serviceName, bookingReference) {
  try {
    // Combine date and time
    const bookingDateTime = new Date(`${bookingDate}T${startTime}`);
    
    // Schedule 1 day before reminder
    const oneDayBefore = new Date(bookingDateTime.getTime() - 24 * 60 * 60 * 1000);
    if (oneDayBefore > new Date()) {
      const jobKey1Day = `reminder_1day_${bookingId}`;
      const job1Day = schedule.scheduleJob(oneDayBefore, async () => {
        try {
          await notifyUser(
            userId,
            'booking_reminder_24h',
            `Reminder: Your ${serviceName} booking (${bookingReference}) is tomorrow at ${startTime}. Don't forget!`
          );
          console.log(`✅ 1-day reminder sent for booking ${bookingReference}`);
          scheduledReminders.delete(jobKey1Day);
        } catch (err) {
          console.error(`❌ Failed to send 1-day reminder for booking ${bookingReference}:`, err);
        }
      });
      scheduledReminders.set(jobKey1Day, job1Day);
      console.log(`📅 Scheduled 1-day reminder for booking ${bookingReference} at ${oneDayBefore}`);
    }

    // Schedule 1 hour before reminder
    const oneHourBefore = new Date(bookingDateTime.getTime() - 60 * 60 * 1000);
    if (oneHourBefore > new Date()) {
      const jobKey1Hour = `reminder_1hour_${bookingId}`;
      const job1Hour = schedule.scheduleJob(oneHourBefore, async () => {
        try {
          await notifyUser(
            userId,
            'booking_reminder_1h',
            `Reminder: Your ${serviceName} booking (${bookingReference}) starts in 1 hour at ${startTime}. Get ready!`
          );
          console.log(`✅ 1-hour reminder sent for booking ${bookingReference}`);
          scheduledReminders.delete(jobKey1Hour);
        } catch (err) {
          console.error(`❌ Failed to send 1-hour reminder for booking ${bookingReference}:`, err);
        }
      });
      scheduledReminders.set(jobKey1Hour, job1Hour);
      console.log(`📅 Scheduled 1-hour reminder for booking ${bookingReference} at ${oneHourBefore}`);
    }
  } catch (error) {
    console.error('Error scheduling booking reminders:', error);
  }
}

/**
 * Cancel scheduled reminders for a booking
 * @param {number} bookingId - Booking ID
 */
export async function cancelBookingReminders(bookingId) {
  try {
    const jobKey1Day = `reminder_1day_${bookingId}`;
    const jobKey1Hour = `reminder_1hour_${bookingId}`;

    if (scheduledReminders.has(jobKey1Day)) {
      const job = scheduledReminders.get(jobKey1Day);
      job.cancel();
      scheduledReminders.delete(jobKey1Day);
      console.log(`❌ Cancelled 1-day reminder for booking ${bookingId}`);
    }

    if (scheduledReminders.has(jobKey1Hour)) {
      const job = scheduledReminders.get(jobKey1Hour);
      job.cancel();
      scheduledReminders.delete(jobKey1Hour);
      console.log(`❌ Cancelled 1-hour reminder for booking ${bookingId}`);
    }
  } catch (error) {
    console.error('Error cancelling booking reminders:', error);
  }
}

/**
 * Reschedule reminders when booking is rescheduled
 * @param {number} bookingId - Booking ID
 * @param {number} userId - User ID
 * @param {string} newDate - New booking date (YYYY-MM-DD)
 * @param {string} newTime - New start time (HH:MM:SS)
 * @param {string} serviceName - Service name
 * @param {string} bookingReference - Booking reference
 */
export async function rescheduleBookingReminders(bookingId, userId, newDate, newTime, serviceName, bookingReference) {
  try {
    // Cancel old reminders
    await cancelBookingReminders(bookingId);
    
    // Schedule new reminders
    await scheduleBookingReminders(bookingId, userId, newDate, newTime, serviceName, bookingReference);
    console.log(`🔄 Rescheduled reminders for booking ${bookingReference}`);
  } catch (error) {
    console.error('Error rescheduling booking reminders:', error);
  }
}

/**
 * Load and reschedule all active booking reminders on server startup
 */
export async function loadActiveReminders() {
  try {
    console.log('🔄 Loading active booking reminders...');
    
    // Get all upcoming bookings
    const bookings = await query(
      `SELECT b.booking_id, b.booking_reference, b.user_id, b.booking_date, b.start_time, b.service_name
       FROM bookings b
       WHERE b.status IN ('pending', 'confirmed')
       AND CONCAT(b.booking_date, ' ', b.start_time) > NOW()
       ORDER BY b.booking_date, b.start_time`
    );

    console.log(`Found ${bookings.length} active bookings to schedule reminders for`);

    for (const booking of bookings) {
      await scheduleBookingReminders(
        booking.booking_id,
        booking.user_id,
        booking.booking_date,
        booking.start_time,
        booking.service_name || 'Your booking',
        booking.booking_reference
      );
    }

    console.log(`✅ Loaded ${bookings.length} booking reminders`);
  } catch (error) {
    console.error('Error loading active reminders:', error);
  }
}
