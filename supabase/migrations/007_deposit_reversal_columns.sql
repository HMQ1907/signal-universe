-- Track first-deposit snapshot on deposit rows (for admin reject reversal).
-- Link deposit_referral rows back to the deposit that triggered them.
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_first_deposit BOOLEAN DEFAULT NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS source_deposit_id BIGINT REFERENCES transactions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_source_deposit_id ON transactions(source_deposit_id) WHERE source_deposit_id IS NOT NULL;
