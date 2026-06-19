import { supabase } from '@/lib/supabase';
import { VoiceRoom, VoiceRoomMember } from '@/types';

export const voiceService = {
  // Fetch active voice rooms with host profile details
  async getActiveRooms(): Promise<VoiceRoom[]> {
    try {
      const { data, error } = await supabase
        .from('voice_rooms')
        .select(`
          *,
          host:profiles (
            id,
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rooms: VoiceRoom[] = [];
      for (const r of data || []) {
        // Query active member count
        const { count, error: countError } = await supabase
          .from('voice_room_members')
          .select('id', { count: 'exact', head: true })
          .eq('room_id', r.id)
          .is('left_at', null);

        if (countError) {
          console.error('Error fetching member count:', countError);
        }

        rooms.push({
          ...r,
          membersCount: count || 0,
        });
      }

      return rooms;
    } catch (err) {
      console.error('Error fetching active voice rooms:', err);
      return [];
    }
  },

  // Create a new voice room
  async createRoom(hostId: string, title: string, description: string): Promise<VoiceRoom | null> {
    try {
      const { data, error } = await supabase
        .from('voice_rooms')
        .insert({
          host_id: hostId,
          title,
          description,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating voice room:', err);
      return null;
    }
  },

  // End an active room (host only)
  async endRoom(roomId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('voice_rooms')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('id', roomId);

      if (error) throw error;

      // Mark all members as left
      await supabase
        .from('voice_room_members')
        .update({ left_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .is('left_at', null);

      return true;
    } catch (err) {
      console.error('Error ending voice room:', err);
      return false;
    }
  },

  // Join a voice room
  async joinRoom(roomId: string, userId: string): Promise<VoiceRoomMember | null> {
    try {
      // First ensure the user isn't already active in this room
      const { data: existing } = await supabase
        .from('voice_room_members')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .is('left_at', null)
        .maybeSingle();

      if (existing) return existing;

      // Insert new member
      const { data, error } = await supabase
        .from('voice_room_members')
        .insert({
          room_id: roomId,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error joining voice room:', err);
      return null;
    }
  },

  // Leave a voice room
  async leaveRoom(roomId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('voice_room_members')
        .update({ left_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .is('left_at', null);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error leaving voice room:', err);
      return false;
    }
  },

  // Get active members inside a voice room
  async getRoomMembers(roomId: string): Promise<VoiceRoomMember[]> {
    try {
      const { data, error } = await supabase
        .from('voice_room_members')
        .select(`
          *,
          user:profiles (
            id,
            display_name,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('room_id', roomId)
        .is('left_at', null);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching room members:', err);
      return [];
    }
  },
};
