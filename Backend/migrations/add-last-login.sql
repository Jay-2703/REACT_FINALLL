-- Add last_login column to users table
ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL DEFAULT NULL AFTER updated_at;

-- Create index for faster queries
CREATE INDEX idx_last_login ON users(last_login);
