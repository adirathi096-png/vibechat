-- SQL Script to Purge All Bot Users, Messages, and Channels
-- Run this in your Supabase SQL Editor to instantly clean your database.

-- 1. Delete bot users from auth.users (this will automatically cascade and delete profiles, messages, conversations, and vibes)
DELETE FROM auth.users 
WHERE email ILIKE '%bot%' 
   OR email ILIKE '%ai%'
   OR raw_user_meta_data->>'name' ILIKE '%bot%'
   OR raw_user_meta_data->>'name' ILIKE '%ai%'
   OR id IN (
     SELECT id FROM profiles 
     WHERE username ILIKE '%bot%' 
        OR username ILIKE '%ai%'
        OR display_name ILIKE '%bot%' 
        OR display_name ILIKE '%ai%'
   );

-- 2. Clean up any profiles that don't have matching auth.users records
DELETE FROM profiles 
WHERE username ILIKE '%bot%' 
   OR username ILIKE '%ai%'
   OR display_name ILIKE '%bot%' 
   OR display_name ILIKE '%ai%';

-- 3. Delete any conversation channels that have become empty (i.e. had their members deleted)
DELETE FROM conversations 
WHERE id NOT IN (
  SELECT DISTINCT conversation_id FROM conversation_members
);

-- 4. Delete any voice rooms hosted by deleted hosts
DELETE FROM voice_rooms 
WHERE host_id NOT IN (
  SELECT id FROM profiles
);
