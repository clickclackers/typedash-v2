-- Restore old columns
ALTER TABLE challenges 
  ADD COLUMN IF NOT EXISTS category VARCHAR(255),
  ADD COLUMN IF NOT EXISTS text_hash VARCHAR(255);

-- Drop category_id column
ALTER TABLE challenges DROP COLUMN IF EXISTS category_id;

-- Drop categories table
DROP TABLE IF EXISTS categories;
