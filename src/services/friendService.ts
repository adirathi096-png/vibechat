import { supabase } from '@/lib/supabase';
import { FriendRequest, Profile } from '@/types';

export const friendService = {
  // Send a friend request
  async sendFriendRequest(senderId: string, receiverId: string): Promise<FriendRequest | null> {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error sending friend request:', err);
      return null;
    }
  },

  // Accept or Reject a friend request
  async respondToFriendRequest(requestId: string, status: 'accepted' | 'rejected'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error responding to friend request:', err);
      return false;
    }
  },

  // Get pending friend requests received by the user
  async getIncomingRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender:profiles (
            id,
            display_name,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('receiver_id', userId)
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching incoming requests:', err);
      return [];
    }
  },

  // Get pending friend requests sent by the user
  async getOutgoingRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          receiver:profiles (
            id,
            display_name,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('sender_id', userId)
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching outgoing requests:', err);
      return [];
    }
  },

  // Get active friends list (where request status is 'accepted')
  async getFriends(userId: string): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          sender_id,
          receiver_id,
          sender:profiles!friend_requests_sender_id_fkey (
            id,
            display_name,
            username,
            avatar_url,
            bio,
            profile_completed
          ),
          receiver:profiles!friend_requests_receiver_id_fkey (
            id,
            display_name,
            username,
            avatar_url,
            bio,
            profile_completed
          )
        `)
        .eq('status', 'accepted')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

      if (error) throw error;

      const friends: Profile[] = [];
      for (const req of data || []) {
        if (req.sender_id === userId && req.receiver) {
          friends.push(req.receiver as unknown as Profile);
        } else if (req.receiver_id === userId && req.sender) {
          friends.push(req.sender as unknown as Profile);
        }
      }

      return friends;
    } catch (err) {
      console.error('Error fetching friends:', err);
      return [];
    }
  },

  // Check relationship status between two users
  async getFriendshipStatus(currentUserId: string, otherUserId: string): Promise<{
    status: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
    requestId?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { status: 'none' };

      if (data.status === 'accepted') {
        return { status: 'accepted', requestId: data.id };
      } else if (data.status === 'pending') {
        if (data.sender_id === currentUserId) {
          return { status: 'pending_sent', requestId: data.id };
        } else {
          return { status: 'pending_received', requestId: data.id };
        }
      }

      return { status: 'none' };
    } catch (err) {
      console.error('Error checking friendship status:', err);
      return { status: 'none' };
    }
  },
};
