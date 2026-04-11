-- Total balance (profit + locked) at AI confirm time; profit credited = 2% of this (see signal_confirmations.amount).
ALTER TABLE signal_confirmations
  ADD COLUMN IF NOT EXISTS total_balance_snapshot DECIMAL(18,2);

COMMENT ON COLUMN signal_confirmations.amount IS 'Session profit to credit on approval (2% of total_balance_snapshot at confirm)';
COMMENT ON COLUMN signal_confirmations.balance_snapshot IS 'Profit balance (excl. locked capital) at confirm time';
COMMENT ON COLUMN signal_confirmations.total_balance_snapshot IS 'balance + locked_capital at confirm time';
