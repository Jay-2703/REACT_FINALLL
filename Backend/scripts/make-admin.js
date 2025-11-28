import { query } from '../config/db.js';

/**
 * Script to make a user an admin
 * Usage: node scripts/make-admin.js <user_id>
 */

const userId = process.argv[2];

if (!userId) {
  console.error('Usage: node scripts/make-admin.js <user_id>');
  console.error('Example: node scripts/make-admin.js 1');
  process.exit(1);
}

async function makeAdmin() {
  try {
    // Get user first
    const [user] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      console.error(`User with ID ${userId} not found`);
      process.exit(1);
    }

    console.log(`Found user: ${user.first_name} ${user.last_name} (${user.email})`);
    console.log(`Current role: ${user.role}`);

    // Update role to admin
    await query('UPDATE users SET role = ? WHERE id = ?', ['admin', userId]);

    console.log(`✅ User ${userId} is now an admin!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

makeAdmin();
