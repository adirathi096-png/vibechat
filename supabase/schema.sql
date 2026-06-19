-- VibeChat Supabase Schema

-- Profiles Table
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  username text unique,
  bio text,
  avatar_url text,
  college text,
  interests text[],
  profile_completed boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Conversations Table
create table conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Conversation Members Table
create table conversation_members (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (conversation_id, user_id)
);

-- Messages Table
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now(),
  read_at timestamp with time zone null
);

-- Friend Requests Table
create table friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (sender_id, receiver_id)
);

-- Vibes Table
create table vibes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  mood text,
  song_title text,
  artist_name text,
  cover_url text,
  external_url text,
  created_at timestamp with time zone default now()
);

-- Voice Rooms Table
create table voice_rooms (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  status text check (status in ('active', 'ended')) default 'active',
  created_at timestamp with time zone default now(),
  ended_at timestamp with time zone null
);

-- Voice Room Members Table
create table voice_room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references voice_rooms(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamp with time zone default now(),
  left_at timestamp with time zone null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table conversations enable row level security;
alter table conversation_members enable row level security;
alter table messages enable row level security;
alter table friend_requests enable row level security;
alter table vibes enable row level security;
alter table voice_rooms enable row level security;
alter table voice_room_members enable row level security;
