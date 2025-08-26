-- Add motivo column to TentativaLogin if it doesn't exist
ALTER TABLE TentativaLogin ADD COLUMN IF NOT EXISTS motivo VARCHAR(64) NULL;
