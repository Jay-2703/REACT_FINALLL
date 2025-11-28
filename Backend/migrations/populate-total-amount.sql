-- Migration: Populate total_amount for existing bookings
-- This script calculates and updates total_amount for bookings that have NULL or 0 values

-- Define pricing per hour (in PHP)
-- music_lesson: 500, recording: 1500, rehearsal: 800, dance: 600, arrangement: 2000, voiceover: 1000

UPDATE bookings 
SET total_amount = CASE 
  WHEN service_type = 'music_lesson' THEN 500 * (duration_minutes / 60)
  WHEN service_type = 'recording' THEN 1500 * (duration_minutes / 60)
  WHEN service_type = 'rehearsal' THEN 800 * (duration_minutes / 60)
  WHEN service_type = 'dance' THEN 600 * (duration_minutes / 60)
  WHEN service_type = 'arrangement' THEN 2000 * (duration_minutes / 60)
  WHEN service_type = 'voiceover' THEN 1000 * (duration_minutes / 60)
  ELSE 800 * (duration_minutes / 60)  -- Default to rehearsal rate
END
WHERE total_amount IS NULL OR total_amount = 0;
