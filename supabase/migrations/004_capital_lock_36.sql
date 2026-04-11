-- Align DB setting with app: principal withdrawal lock is 36 days from first deposit (see app/utils/capital-lock.ts).
UPDATE site_settings SET value = '36' WHERE key = 'capital_lock_days';
