-- SQL Script to Completely Wipe Database & Restart Clean
-- Run this in your Supabase SQL Editor to purge all data.

-- 1. Disable triggers temporarily to avoid check constraints during truncate
SET session_replication_role = 'replica';

-- 2. Truncate all tables in the public schema
TRUNCATE TABLE 
  friend_requests, 
  messages, 
  conversation_members, 
  conversations, 
  vibes, 
  voice_room_members, 
  voice_rooms, 
  profiles 
CASCADE;

-- 3. Delete all registered accounts in auth.users
DELETE FROM auth.users;

-- 4. Restore triggers
SET session_replication_role = 'origin';
