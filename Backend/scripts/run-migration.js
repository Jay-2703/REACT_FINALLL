import { query } from '../config/db.js';
import fs from 'fs';
import path from 'path';

/**
 * Script to run SQL migrations
 * Usage: node scripts/run-migration.js <migration-file>
 * Example: node scripts/run-migration.js add-last-login.sql
 */

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node scripts/run-migration.js <migration-file>');
  console.error('Example: node scripts/run-migration.js add-last-login.sql');
  process.exit(1);
}

async function runMigration() {
  try {
    const migrationPath = path.join(process.cwd(), 'migrations', migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log(`Running migration: ${migrationFile}`);
    console.log('SQL:', sql);

    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await query(statement);
      }
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
