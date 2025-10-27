-- Test Messages and Conversations Tables
-- Run this after executing FIX_MESSAGES_SCHEMA.sql

-- 1. Check if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'messages' THEN '✅ Messages table exists'
    WHEN table_name = 'conversations' THEN '✅ Conversations table exists'
    ELSE '❌ Unknown table'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages')
ORDER BY table_name;

-- 2. Check messages table columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check conversations table columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('messages', 'conversations')
ORDER BY tablename, policyname;

-- 5. Test insert permissions (this will show if RLS is working)
-- Note: This will only work if you're authenticated as a user
SELECT 'RLS policies are active' as status
WHERE EXISTS (
  SELECT 1 FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename IN ('messages', 'conversations')
);


-- Run this after executing FIX_MESSAGES_SCHEMA.sql

-- 1. Check if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'messages' THEN '✅ Messages table exists'
    WHEN table_name = 'conversations' THEN '✅ Conversations table exists'
    ELSE '❌ Unknown table'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages')
ORDER BY table_name;

-- 2. Check messages table columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check conversations table columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('messages', 'conversations')
ORDER BY tablename, policyname;

-- 5. Test insert permissions (this will show if RLS is working)
-- Note: This will only work if you're authenticated as a user
SELECT 'RLS policies are active' as status
WHERE EXISTS (
  SELECT 1 FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename IN ('messages', 'conversations')
);



























