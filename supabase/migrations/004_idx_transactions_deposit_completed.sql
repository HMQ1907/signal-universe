-- Speeds up SUM(amount) for referral team totals (deposit + completed only)
CREATE INDEX IF NOT EXISTS idx_transactions_user_deposit_completed
  ON transactions (user_id)
  WHERE type = 'deposit' AND status = 'completed';
