-- User phone for admin list and required registration
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(32) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_country VARCHAR(16) DEFAULT '+84';
