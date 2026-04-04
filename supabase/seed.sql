-- =============================================
-- Seed Users for Signal Universe Platform
-- Run this in Supabase SQL Editor
-- =============================================
-- NOTE: `npm run seed` (TypeScript) also seeds admin + test user with real bcrypt hashes.
--
-- If you already ran an older seed.sql with fake hashes, login will fail until you either:
--   DELETE FROM users WHERE email IN ('user@signal-universe.io','admin@signal-universe.io');
--   then re-run this file, OR run the UPDATE statements at the bottom of this file.
-- =============================================

-- Admin Account
-- Email: admin@signal-universe.io
-- Password: Admin@123
-- Hash: bcrypt 10 rounds (verified with bcryptjs compare)
INSERT INTO users (email, password_hash, full_name, is_admin, is_active, email_verified, balance, referral_code)
VALUES (
    'admin@signal-universe.io',
    '$2b$10$o4jL5QmhyCayb6TkrQmBRe7jwijmMYy5.bbR0TdXrP6AUUNUnRwdC',
    'Administrator',
    TRUE,
    TRUE,
    TRUE,
    0,
    'SUADMIN01'
)
ON CONFLICT (email) DO NOTHING;

-- Test User Account
-- Email: user@signal-universe.io
-- Password: User@123
-- Hash: bcrypt 10 rounds (verified with bcryptjs compare)
INSERT INTO users (email, password_hash, full_name, is_admin, is_active, email_verified, balance, referral_code)
VALUES (
    'user@signal-universe.io',
    '$2b$10$NXZp1UM/20MIzstGU3PSmOZ1aoDJBLM66HuRyrhgayvdngadpxW5e',
    'Test User',
    FALSE,
    TRUE,
    TRUE,
    1000,
    'SUUSER01'
)
ON CONFLICT (email) DO NOTHING;

-- Create today's daily AI confirm session
INSERT INTO signal_sessions (session_date, time_window, status) VALUES
    (CURRENT_DATE, 'daily', 'open')
ON CONFLICT (session_date, time_window) DO NOTHING;

-- Fix wrong password_hash from older seeds (optional — run if login still fails after INSERT above did nothing)
-- UPDATE users SET password_hash = '$2b$10$o4jL5QmhyCayb6TkrQmBRe7jwijmMYy5.bbR0TdXrP6AUUNUnRwdC' WHERE email = 'admin@signal-universe.io';
-- UPDATE users SET password_hash = '$2b$10$NXZp1UM/20MIzstGU3PSmOZ1aoDJBLM66HuRyrhgayvdngadpxW5e' WHERE email = 'user@signal-universe.io';

-- Show created users
SELECT id, email, full_name, is_admin, balance, referral_code, created_at
FROM users
WHERE email IN ('admin@signal-universe.io', 'user@signal-universe.io');
