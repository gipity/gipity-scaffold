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

-- ===========================================================
-- INSTRUCTIONS FOR RUNNING THIS SCRIPT
--
-- 1. First create your admin user in Supabase Auth dashboard:
--    - Go to Authentication → Users
--    - Click "Add User" 
--    - Enter email and password
--    - Check "Auto Confirm User" box
--    - Click "Create User"
--
-- 2. Edit the admin user INSERT statement below (around line 260):
--    - Replace 'admin@yourapp.com' with your actual email
--    - Replace 'Your_First_Name' and 'Your_Last_Name' with real values
--
-- 3. Run this script:
--    - Copy this entire file (Ctrl+A, Ctrl+C)
--    - Go to Supabase project → SQL Editor tab
--    - Paste entire script (Ctrl+V) and click "Run"
--
-- 4. After running this script, manually configure the storage bucket:
--    - Go to Storage → Settings in Supabase dashboard
--    - Ensure the storage bucket is set to public
--    - Set max upload file size: 5 MB
--    - Set allowed MIME types: image/*
--
-- WHAT THIS CREATES:
--    - users table (linked to Supabase auth)
--    - notes table (user content with photo support)  
--    - images storage bucket (public access)
--    - Security policies (RLS) for data protection
--    - Admin verification functions
--    - Performance indexes
-- ===================================================================

-- ===================================================================
-- SECTION 1: CORE UTILITY FUNCTIONS
-- ===================================================================

-- Automatic timestamp updater for modified records
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;

-- Admin verification function (bypasses RLS to prevent infinite recursion)
-- CRITICAL: This function prevents authentication failures in admin operations
CREATE OR REPLACE FUNCTION verify_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SELECT (user_type = 'admin') INTO result
  FROM users
  WHERE id = user_id;

  RETURN COALESCE(result, false);
END;
$$;

-- Grant necessary permissions for admin verification
GRANT EXECUTE ON FUNCTION verify_admin_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_admin_user(UUID) TO service_role;

-- ===================================================================
-- SECTION 2: USERS TABLE (Authentication Integration)
-- ===================================================================

-- Main users table linked to Supabase auth system
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  user_type TEXT NOT NULL DEFAULT 'user' CHECK (user_type IN ('user', 'admin')),

  -- Profile information
  first_name TEXT,
  last_name TEXT,

  -- Automatic timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);

-- Automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE
ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for data protection
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Users and admins can view users" ON users;
DROP POLICY IF EXISTS "Users and admins can update users" ON users;

-- Optimized RLS policies (single policies prevent multiple permissive warnings)
CREATE POLICY "Users and admins can view users" ON users
  FOR SELECT 
  TO authenticated
  USING (
    (SELECT auth.uid()) = id 
    OR verify_admin_user((SELECT auth.uid()))
  );

CREATE POLICY "Users and admins can update users" ON users
  FOR UPDATE 
  TO authenticated
  USING (
    (SELECT auth.uid()) = id 
    OR verify_admin_user((SELECT auth.uid()))
  );

-- Documentation comments
COMMENT ON TABLE users IS 'User profiles integrated with Supabase authentication';
COMMENT ON COLUMN users.id IS 'UUID foreign key to auth.users (Supabase auth system)';
COMMENT ON COLUMN users.email IS 'User email address (must match auth.users.email exactly)';
COMMENT ON COLUMN users.user_type IS 'Role-based access: user (default) or admin';

-- ===================================================================
-- SECTION 3: NOTES TABLE (Content Management)
-- ===================================================================

-- Content table for user-generated notes with multimedia support
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  photo_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes for fast content retrieval
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- Automatic timestamp updates
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE
ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

-- Secure RLS policies (users can only access their own content)
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT 
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own notes" ON notes
  FOR INSERT 
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE 
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE 
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Documentation comments
COMMENT ON TABLE notes IS 'User content with multimedia support (text + photos)';
COMMENT ON COLUMN notes.photo_path IS 'Storage path for uploaded photos (stored in images bucket)';

-- ===================================================================
-- SECTION 4: STORAGE BUCKET (Image Uploads)
-- ===================================================================

-- Create public images bucket for photo uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Clean up existing storage policies
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Storage security policies (users can only manage their own folders)
CREATE POLICY "Users can upload their own images" ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    bucket_id = 'images' 
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT 
  TO public
  USING (bucket_id = 'images');

CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE 
  TO authenticated
  USING (
    bucket_id = 'images' 
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE 
  TO authenticated
  USING (
    bucket_id = 'images' 
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- ===================================================================
-- SECTION 5: SETUP VERIFICATION
-- ===================================================================

-- Verify database setup completed successfully
SELECT 
  '✅ Database schema created successfully!' as status,
  COUNT(*) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'notes');

-- ===================================================================
-- ADMIN USER SETUP (REQUIRED)
-- ===================================================================
-- 
-- IMPORTANT: Edit the values below before running this script!
-- This links your Supabase auth user to the database users table.

-- Create admin user record in database (EDIT THE VALUES BELOW)
INSERT INTO users (id, email, user_type, first_name, last_name)
SELECT 
  id,
  email,
  'admin' as user_type,
  'Your_First_Name' as first_name,    -- ← EDIT THIS
  'Your_Last_Name' as last_name       -- ← EDIT THIS
FROM auth.users 
WHERE email = 'admin@yourapp.com';    -- ← EDIT THIS EMAIL

-- ===================================================================
-- END OF SETUP SCRIPT
-- ===================================================================
-- 
-- 🎯 Your Supabase is now configured and ready for the Gipity scaffold app!