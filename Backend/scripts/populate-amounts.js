import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const PRICING = {
  music_lesson: 500,
  recording: 1500,
  rehearsal: 800,
  dance: 600,
  arrangement: 2000,
  voiceover: 1000
};

async function populateAmounts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mixlab_studio'
  });

  try {
    console.log('🔄 Populating total_amount for existing bookings...');

    // Get all bookings with NULL or 0 total_amount
    const [bookings] = await connection.query(
      'SELECT booking_id, service_type, duration_minutes FROM bookings WHERE total_amount IS NULL OR total_amount = 0'
    );

    console.log(`Found ${bookings.length} bookings to update`);

    let updated = 0;
    for (const booking of bookings) {
      const rate = PRICING[booking.service_type] || PRICING.rehearsal;
      const hours = booking.duration_minutes / 60;
      const totalAmount = rate * hours;

      await connection.query(
        'UPDATE bookings SET total_amount = ? WHERE booking_id = ?',
        [totalAmount, booking.booking_id]
      );

      updated++;
      console.log(` Updated booking ${booking.booking_id}: ₱${totalAmount.toFixed(2)}`);
    }

    console.log(`\n Successfully updated ${updated} bookings!`);
  } catch (error) {
    console.error(' Error populating amounts:', error);
  } finally {
    await connection.end();
  }
}

populateAmounts();
