-- First deposit used to add principal to both locked_capital and balance (bug).
-- Remove the duplicate principal from profit balance for users who already completed first deposit.
-- Safe for users fixed by new code: balance < first_deposit_amount → no row updated.
UPDATE users
SET balance = balance - first_deposit_amount
WHERE first_deposit_at IS NOT NULL
  AND first_deposit_amount IS NOT NULL
  AND balance >= first_deposit_amount;
