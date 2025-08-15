-- ==============================================================================
-- Gipity Scaffold - Supabase Setup
-- 
-- Copyright (c) 2025 Gipity. Licensed under the MIT License.
--
-- This script is part of the Gipity Scaffold:
-- https://github.com/gipity/gipity-scaffold
--
-- For additional support:
-- https://www.gipity.com
--
-- MIT licensed – free to use in your own apps.
-- Please do not resell or repackage as part of a commercial toolkit unless you're building on it in good faith and contributing back.
-- ==============================================================================

-- ===================================================================
-- REMOVE NOTES TABLE AND ASSOCIATED SCHEMA
-- One-off cleanup script to remove demo notes functionality
-- ===================================================================

-- Drop RLS policies first
DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

-- Drop triggers
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;

-- Drop indexes
DROP INDEX IF EXISTS idx_notes_user_id;
DROP INDEX IF EXISTS idx_notes_created_at;

-- Drop the notes table
DROP TABLE IF EXISTS notes;

-- Remove any comments/documentation
-- (Comments are automatically removed with table drop)

-- Note: Storage bucket 'images' and related policies are kept
-- as they may be useful for future features like profile photos