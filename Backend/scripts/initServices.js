import { query } from '../config/db.js';

const SERVICES = [
  { name: 'Music Lessons', instrument: 'music_lesson', price: 600 },
  { name: 'Recording', instrument: 'recording', price: 800 },
  { name: 'Mixing', instrument: 'mixing', price: 1000 },
  { name: 'Band Rehearsal', instrument: 'band_rehearsal', price: 1200 },
  { name: 'Production', instrument: 'production', price: 1500 }
];

async function initializeServices() {
  for (const svc of SERVICES) {
    try {
      const existing = await query(
        'SELECT service_id FROM services WHERE instrument = ?',
        [svc.instrument]
      );

      if (!existing || existing.length === 0) {
        await query(
          'INSERT INTO services (service_name, instrument, price_per_hour, is_active) VALUES (?, ?, ?, 1)',
          [svc.name, svc.instrument, svc.price]
        );
        console.log(`✓ Created service: ${svc.name}`);
      } else {
        console.log(`✓ Service exists: ${svc.name}`);
      }
    } catch (err) {
      console.error(`✗ Failed to create ${svc.name}:`, err.message);
    }
  }
}

initializeServices()
  .then(() => {
    console.log('Service initialization complete.');
  })
  .catch((err) => {
    console.error('Service initialization failed:', err);
  });
