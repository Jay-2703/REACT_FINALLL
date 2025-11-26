-- =====================================================
-- Migration: Add Xendit Payment Columns
-- =====================================================
-- This script adds missing columns needed for Xendit payment integration

-- Add payment columns to bookings table
ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending' AFTER user_notes;
ALTER TABLE bookings ADD COLUMN xendit_payment_id VARCHAR(255) AFTER payment_status;
ALTER TABLE bookings ADD COLUMN xendit_invoice_id VARCHAR(255) AFTER xendit_payment_id;
ALTER TABLE bookings ADD CONSTRAINT chk_payment_status CHECK (payment_status IN ('pending', 'paid', 'expired', 'failed'));

-- Add Xendit columns to transactions table
ALTER TABLE transactions ADD COLUMN xendit_payment_id VARCHAR(255) AFTER gateway_response;
ALTER TABLE transactions ADD COLUMN xendit_invoice_id VARCHAR(255) AFTER xendit_payment_id;

-- Add indexes for better query performance
ALTER TABLE transactions ADD INDEX idx_transactions_xendit_payment (xendit_payment_id);
ALTER TABLE transactions ADD INDEX idx_transactions_xendit_invoice (xendit_invoice_id);

-- Update payment_method constraint to include xendit
ALTER TABLE transactions MODIFY COLUMN payment_method VARCHAR(50) NOT NULL;
ALTER TABLE transactions DROP CONSTRAINT chk_payment_method;
ALTER TABLE transactions ADD CONSTRAINT chk_payment_method CHECK (payment_method IN ('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash', 'gcash', 'paymaya', 'xendit', 'other'));

-- Verify changes
SELECT 'Migration completed successfully!' as status;
