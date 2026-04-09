-- Immutable snapshot of the first completed deposit principal (audit / display).
-- Time of first deposit remains users.first_deposit_at (already exists).
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS first_deposit_amount DECIMAL(18,2) DEFAULT NULL;

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS check_first_deposit_amount_non_negative;

ALTER TABLE users
  ADD CONSTRAINT check_first_deposit_amount_non_negative
  CHECK (first_deposit_amount IS NULL OR first_deposit_amount >= 0);

COMMENT ON COLUMN users.first_deposit_amount IS 'Principal amount of the first completed deposit; locked_capital may decrease after partial capital withdrawals';

-- Best-effort backfill: for users who already have a first deposit timestamp, use current locked_capital as proxy
-- (may be lower than the true first amount if capital was partially withdrawn before this migration).
UPDATE users
SET first_deposit_amount = locked_capital
WHERE first_deposit_at IS NOT NULL
  AND first_deposit_amount IS NULL
  AND locked_capital > 0;
