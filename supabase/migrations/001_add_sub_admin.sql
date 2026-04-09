-- Migration: add is_sub_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_sub_admin BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_users_is_sub_admin ON users(is_sub_admin);
