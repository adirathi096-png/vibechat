-- Seed Data for VibeChat (Optional Staging Seed)
-- Note: Run this SQL only if you want to populate your database with dummy users for testing.
-- To avoid issues with auth, you can register users normally in the app, or run the queries below:

-- Insert mock users into auth.users (dummy hashes)
-- We insert 4 real-looking user accounts to test discover/friend/chat flows.

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'mia@vibechat.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Mia"}', now(), now(), 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'james@vibechat.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"James"}', now(), now(), 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', 'alex@vibechat.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Alex"}', now(), now(), 'authenticated', 'authenticated'),
  ('44444444-4444-4444-4444-444444444444', 'neha@vibechat.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Neha"}', now(), now(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Insert corresponding user profiles
INSERT INTO profiles (id, display_name, username, bio, avatar_url, college, interests, profile_completed, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Mia', 'mia.vibes', 'Live, love, listen. Running on iced lattes ☕', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80', 'Mumbai University', ARRAY['Chill', 'Study', 'Lofi'], true, now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'James', 'james.synth', 'Synthesizers & starry skies. Night driver 🌃', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80', 'IIT Bombay', ARRAY['Night Drive', 'Synthwave', 'Electronic'], true, now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'Alex', 'alex.lofi', 'Coding with anime beats. ☕💻', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80', 'Stanford University', ARRAY['Anime', 'Study', 'Coding'], true, now(), now()),
  ('44444444-4444-4444-4444-444444444444', 'Neha', 'neha.melody', 'Bollywood acoustic playlist hoarder ✨', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80', 'Delhi University', ARRAY['Party', 'Pop', 'Acoustic'], true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Seed Vibes
INSERT INTO vibes (id, user_id, title, description, mood, song_title, artist_name, cover_url, external_url, created_at)
VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Morning coffee acoustic', 'Perfect mood for study sessions', 'Chill', 'Golden Hour', 'JVKE', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&h=300&q=80', 'https://open.spotify.com/track/5ee46ae9b5e5c5', now()),
  ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Midnight drive synth', 'Outrun retro vibes', 'Night Drive', 'Night Drive', 'Kavinsky', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&h=300&q=80', 'https://open.spotify.com/track/5ee46ae9b5e5c6', now()),
  ('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Lofi hiphop beats to code to', 'Stay focused and caffeinated', 'Study', 'Bloom', 'The Paper Kites', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=300&h=300&q=80', 'https://open.spotify.com/track/5ee46ae9b5e5c7', now())
ON CONFLICT (id) DO NOTHING;

-- Seed Voice Rooms
INSERT INTO voice_rooms (id, host_id, title, description, status, created_at)
VALUES
  ('b1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Late Night Vibes 🌙', 'Chilled deep electronic synths, lofi hip-hop & indie pop for night riders.', 'active', now()),
  ('b2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Lofi Study 🪴', 'Relax, focus, study. Esthetic beats to write code and sip coffee to.', 'active', now())
ON CONFLICT (id) DO NOTHING;
