-- =============================================
-- Signal Universe - Database Schema
-- =============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- ENUM Types
-- =============================================

CREATE TYPE transaction_type AS ENUM (
  'deposit',
  'withdraw_profit',
  'withdraw_capital',
  'signal_profit',
  'signal_referral',
  'deposit_referral',
  'leader_bonus',
  'admin_adjust'
);

CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'rejected', 'cancelled');
CREATE TYPE otp_type AS ENUM ('reset_password', 'verify_email');

-- =============================================
-- Users Table
-- =============================================

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),

  -- Balances
  balance DECIMAL(18,2) DEFAULT 0.00,          -- profit balance (withdrawable)
  locked_capital DECIMAL(18,2) DEFAULT 0.00,   -- principal locked for 28 days

  -- Investment info
  investment_package INT DEFAULT NULL,          -- 200,300,500,1000,2000,5000
  first_deposit_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,  -- for 28-day lock

  -- CCCD
  cccd_url VARCHAR(500) DEFAULT NULL,

  -- Referral
  referral_code VARCHAR(10) UNIQUE NOT NULL,
  referred_by BIGINT REFERENCES users(id) ON DELETE SET NULL,

  -- Account status
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT check_balance_positive CHECK (balance >= 0),
  CONSTRAINT check_locked_capital_positive CHECK (locked_capital >= 0)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);
CREATE INDEX idx_users_is_admin ON users(is_admin);

-- =============================================
-- Transactions Table
-- =============================================

CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type transaction_type NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  status transaction_status DEFAULT 'pending',

  -- Deposit fields
  tx_hash VARCHAR(100),
  wallet_address VARCHAR(100),
  network VARCHAR(20) DEFAULT 'TRC20',
  package_selected INT DEFAULT NULL,  -- which package tier chosen

  -- Withdraw fields
  withdraw_address VARCHAR(100),
  withdraw_fee DECIMAL(18,2) DEFAULT 0,

  -- Referral fields
  from_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,  -- who generated this bonus
  referral_level INT DEFAULT NULL,  -- F1, F2, F3

  -- Signal fields
  signal_session_id BIGINT DEFAULT NULL,  -- linked to signal session

  -- Admin handling
  processed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  admin_note TEXT,
  adjust_reason TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT check_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_signal_session_id ON transactions(signal_session_id);

-- =============================================
-- Signal Sessions Table
-- 2 sessions per day: 14:00 and 21:00
-- =============================================

CREATE TABLE signal_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_window VARCHAR(10) NOT NULL,  -- '14:00' or '21:00'
  status VARCHAR(20) DEFAULT 'open',  -- open, closed, processed

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT unique_session UNIQUE (session_date, time_window)
);

CREATE INDEX idx_signal_sessions_date ON signal_sessions(session_date DESC);
CREATE INDEX idx_signal_sessions_status ON signal_sessions(status);

-- =============================================
-- Signal Confirmations Table
-- User clicks "Xác nhận AI" button
-- =============================================

CREATE TABLE signal_confirmations (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id BIGINT NOT NULL REFERENCES signal_sessions(id) ON DELETE CASCADE,

  amount DECIMAL(18,2) NOT NULL,        -- 1% of user balance at confirmation time
  profit_amount DECIMAL(18,2) DEFAULT NULL,  -- filled by admin when approving
  balance_snapshot DECIMAL(18,2) NOT NULL,  -- user balance at confirmation time

  status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected
  processed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  admin_note TEXT,

  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_user_session UNIQUE (user_id, session_id)
);

CREATE INDEX idx_signal_confirmations_user_id ON signal_confirmations(user_id);
CREATE INDEX idx_signal_confirmations_session_id ON signal_confirmations(session_id);
CREATE INDEX idx_signal_confirmations_status ON signal_confirmations(status);

-- =============================================
-- Leader Bonus Records Table
-- Weekly payout based on F1 direct count
-- =============================================

CREATE TABLE leader_bonus_records (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  week_start DATE NOT NULL,  -- Monday of the week
  f1_count INT NOT NULL DEFAULT 0,
  leader_level INT NOT NULL,  -- 1-5
  amount DECIMAL(18,2) NOT NULL,

  status VARCHAR(20) DEFAULT 'pending',  -- pending, paid
  paid_at TIMESTAMP WITH TIME ZONE,
  paid_by BIGINT REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_leader_week UNIQUE (user_id, week_start)
);

CREATE INDEX idx_leader_bonus_user_id ON leader_bonus_records(user_id);
CREATE INDEX idx_leader_bonus_week_start ON leader_bonus_records(week_start DESC);
CREATE INDEX idx_leader_bonus_status ON leader_bonus_records(status);

-- =============================================
-- OTP Codes Table
-- =============================================

CREATE TABLE otp_codes (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  type otp_type NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_otp_codes_email ON otp_codes(email);
CREATE INDEX idx_otp_codes_expires_at ON otp_codes(expires_at);

-- =============================================
-- Sessions Table (custom auth)
-- =============================================

CREATE TABLE sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- =============================================
-- Admin Logs Table
-- =============================================

CREATE TABLE admin_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  target_transaction_id BIGINT REFERENCES transactions(id) ON DELETE SET NULL,
  old_value TEXT,
  new_value TEXT,
  amount_change DECIMAL(18,2),
  ip_address VARCHAR(45),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_target_user_id ON admin_logs(target_user_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- =============================================
-- Site Settings Table
-- =============================================

CREATE TABLE site_settings (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO site_settings (key, value, description) VALUES
  ('trc20_wallet_address', '', 'USDT TRC20 deposit wallet address'),
  ('min_deposit', '200', 'Minimum deposit (USD)'),
  ('min_withdraw', '10', 'Minimum withdrawal (USD)'),
  ('withdraw_fee_percent', '3', 'Withdrawal fee (%)'),
  ('withdraw_time_start', '22:00', 'Withdrawal window start'),
  ('withdraw_time_end', '24:00', 'Withdrawal window end'),
  ('capital_lock_days', '28', 'Capital lock period (days)'),
  ('signal_confirm_window', '20', 'Minutes AI confirm button is visible'),
  ('signal_profit_percent', '1', 'Signal uses X% of balance'),
  ('max_daily_profit_percent', '2', 'Max daily profit percent'),
  ('deposit_referral_f1', '5', 'Deposit referral commission F1 (%)'),
  ('deposit_referral_f2', '3', 'Deposit referral commission F2 (%)'),
  ('signal_referral_f1', '15', 'Signal profit referral F1 (%)'),
  ('signal_referral_f2', '10', 'Signal profit referral F2 (%)'),
  ('signal_referral_f3', '5', 'Signal profit referral F3 (%)'),
  ('leader1_f1_min', '10', 'Leader 1 minimum F1 count'),
  ('leader1_bonus', '50', 'Leader 1 weekly bonus (USD)'),
  ('leader2_f1_min', '20', 'Leader 2 minimum F1 count'),
  ('leader2_bonus', '100', 'Leader 2 weekly bonus (USD)'),
  ('leader3_f1_min', '50', 'Leader 3 minimum F1 count'),
  ('leader3_bonus', '200', 'Leader 3 weekly bonus (USD)'),
  ('leader4_f1_min', '100', 'Leader 4 minimum F1 count'),
  ('leader4_bonus', '500', 'Leader 4 weekly bonus (USD)'),
  ('leader5_f1_min', '200', 'Leader 5 minimum F1 count'),
  ('leader5_bonus', '1000', 'Leader 5 weekly bonus (USD)'),
  ('site_name', 'Signal Universe', 'Site name'),
  ('support_email', 'support@signal-universe.io', 'Support email'),
  ('telegram_link', '', 'Telegram support link');

-- =============================================
-- Notifications Table
-- =============================================

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =============================================
-- Functions & Triggers
-- =============================================

CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(10) AS $$
DECLARE
  chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result VARCHAR(10) := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * 36 + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code VARCHAR(10);
  code_exists BOOLEAN;
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    LOOP
      new_code := generate_referral_code();
      SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.referral_code := new_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_transactions_updated_at
  BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_site_settings_updated_at
  BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leader_bonus_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON users FOR ALL USING (true);
CREATE POLICY "service_role_all" ON transactions FOR ALL USING (true);
CREATE POLICY "service_role_all" ON signal_sessions FOR ALL USING (true);
CREATE POLICY "service_role_all" ON signal_confirmations FOR ALL USING (true);
CREATE POLICY "service_role_all" ON leader_bonus_records FOR ALL USING (true);
CREATE POLICY "service_role_all" ON otp_codes FOR ALL USING (true);
CREATE POLICY "service_role_all" ON sessions FOR ALL USING (true);
CREATE POLICY "service_role_all" ON admin_logs FOR ALL USING (true);
CREATE POLICY "service_role_all" ON notifications FOR ALL USING (true);

-- =============================================
-- Useful Views
-- =============================================

CREATE OR REPLACE VIEW user_overview AS
SELECT
  u.id,
  u.email,
  u.full_name,
  u.balance,
  u.locked_capital,
  u.investment_package,
  u.first_deposit_at,
  u.referral_code,
  u.is_active,
  u.cccd_url,
  u.created_at,
  (SELECT COUNT(*) FROM users f1 WHERE f1.referred_by = u.id) AS direct_f1_count,
  (SELECT COALESCE(SUM(amount),0) FROM transactions t WHERE t.user_id = u.id AND t.type = 'deposit' AND t.status = 'completed') AS total_deposited
FROM users u;

-- RPC for bcrypt password verification
CREATE OR REPLACE FUNCTION verify_bcrypt_password(plain_password TEXT, hashed_password TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT crypt(plain_password, hashed_password) = hashed_password;
$$;
