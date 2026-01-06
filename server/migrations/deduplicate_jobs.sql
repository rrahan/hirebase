-- Job Deduplication Migration
-- Run this SQL script against your PostgreSQL database to:
-- 1. Add content_hash column
-- 2. Backfill existing jobs
-- 3. Remove duplicates (keeps oldest)
-- 4. Add unique constraint

-- Step 1: Add column
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS content_hash VARCHAR(32);

-- Step 2: Backfill existing records with hash
UPDATE jobs SET content_hash = MD5(LOWER(TRIM(title)) || '|' || LOWER(TRIM(company)))
WHERE content_hash IS NULL;

-- Step 3: Remove duplicates (keep oldest by date_posted)
-- First, identify duplicates and delete newer entries
DELETE FROM jobs a USING jobs b
WHERE a.content_hash = b.content_hash
  AND a.date_posted > b.date_posted;

-- Step 4: Add unique constraint to prevent future duplicates at DB level
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_content_hash ON jobs(content_hash);
