-- VibeChat Supabase RLS Policies

-- PROFILES
create policy "Allow public read profiles" on profiles
  for select using (true);

create policy "Allow user insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Allow user update own profile" on profiles
  for update using (auth.uid() = id);


-- CONVERSATIONS
create policy "Allow members to read conversations" on conversations
  for select using (
    exists (
      select 1 from conversation_members 
      where conversation_id = conversations.id 
      and user_id = auth.uid()
    )
  );

create policy "Allow authenticated users to create conversations" on conversations
  for insert with check (auth.role() = 'authenticated');


-- CONVERSATION MEMBERS
create policy "Allow members to read conversation members" on conversation_members
  for select using (
    exists (
      select 1 from conversation_members cm
      where cm.conversation_id = conversation_members.conversation_id 
      and cm.user_id = auth.uid()
    )
  );

create policy "Allow users to add themselves or add others in conversations they are members of" on conversation_members
  for insert with check (
    auth.uid() = user_id 
    or 
    exists (
      select 1 from conversation_members cm
      where cm.conversation_id = conversation_id 
      and cm.user_id = auth.uid()
    )
  );


-- MESSAGES
create policy "Allow members to read messages" on messages
  for select using (
    exists (
      select 1 from conversation_members 
      where conversation_id = messages.conversation_id 
      and user_id = auth.uid()
    )
  );

create policy "Allow members to insert messages" on messages
  for insert with check (
    auth.uid() = sender_id 
    and exists (
      select 1 from conversation_members 
      where conversation_id = messages.conversation_id 
      and user_id = auth.uid()
    )
  );


-- FRIEND REQUESTS
create policy "Allow users to read their own friend requests" on friend_requests
  for select using (
    auth.uid() = sender_id 
    or auth.uid() = receiver_id
  );

create policy "Allow users to create friend requests as themselves" on friend_requests
  for insert with check (auth.uid() = sender_id);

create policy "Allow users to update requests involving themselves" on friend_requests
  for update using (
    auth.uid() = sender_id 
    or auth.uid() = receiver_id
  );


-- VIBES
create policy "Allow authenticated users to read vibes" on vibes
  for select using (auth.role() = 'authenticated');

create policy "Allow users to manage their own vibes" on vibes
  for all using (auth.uid() = user_id);


-- VOICE ROOMS
create policy "Allow authenticated users to read active voice rooms" on voice_rooms
  for select using (auth.role() = 'authenticated');

create policy "Allow users to create voice rooms as host" on voice_rooms
  for insert with check (auth.uid() = host_id);

create policy "Allow host to manage voice room" on voice_rooms
  for update using (auth.uid() = host_id);


-- VOICE ROOM MEMBERS
create policy "Allow authenticated users to read room members" on voice_room_members
  for select using (auth.role() = 'authenticated');

create policy "Allow users to join or leave room as themselves" on voice_room_members
  for all using (auth.uid() = user_id);
