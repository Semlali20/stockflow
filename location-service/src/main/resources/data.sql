-- Ensure warehouses table has all required columns
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS address VARCHAR(255);
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS is_active BOOLEAN;

-- Default existing warehouses to active
UPDATE warehouses SET is_active = TRUE WHERE is_active IS NULL;

-- Ensure locations table has all required columns
ALTER TABLE locations ADD COLUMN IF NOT EXISTS is_active BOOLEAN;

-- Default existing locations to active
UPDATE locations SET is_active = TRUE WHERE is_active IS NULL;
