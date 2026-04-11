-- Raise platform minimum deposit / DeFi tier floor from $200 to $300
UPDATE site_settings SET value = '300', updated_at = NOW() WHERE key = 'min_deposit';
