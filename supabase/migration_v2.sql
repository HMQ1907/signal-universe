-- =============================================
-- Signal Universe - Migration v2
-- Run in Supabase SQL Editor
-- =============================================

-- Add missing columns to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_sub_admin BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS phone_country VARCHAR(10) DEFAULT '+84',
  ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS wallet_network VARCHAR(10) DEFAULT NULL; -- 'TRC20' or 'BEP20'

-- Index for sub_admin queries
CREATE INDEX IF NOT EXISTS idx_users_is_sub_admin ON users(is_sub_admin);

-- Add tx_hash to transactions (for user-submitted deposit TX ID)
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(255) DEFAULT NULL;

-- Add bep20 wallet to site_settings (column is `description`, not `label`)
INSERT INTO site_settings (key, value, description) VALUES
  ('bep20_wallet_address', '', 'USDT BEP20 deposit wallet address')
ON CONFLICT (key) DO NOTHING;

-- Index for wallet lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address) WHERE wallet_address IS NOT NULL;
