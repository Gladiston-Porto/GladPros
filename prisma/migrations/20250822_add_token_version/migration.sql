-- Add tokenVersion column to Usuario if it doesn't exist
ALTER TABLE Usuario ADD COLUMN IF NOT EXISTS tokenVersion INT NOT NULL DEFAULT 0;
