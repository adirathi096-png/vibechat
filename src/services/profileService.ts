import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

export const profileService = {
  // Fetch a user profile by ID
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Error in getProfile:', err);
      return null;
    }
  },

  // Insert or update a profile
  async saveProfile(profile: Partial<Profile> & { id: string }): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Check if a username is already taken
  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase().trim());

      if (excludeUserId) {
        query = query.neq('id', excludeUserId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data?.length ?? 0) === 0;
    } catch (err) {
      console.error('Error checking username availability:', err);
      // In case of network errors or placeholder DB, default to true or throw depending on design
      return true;
    }
  },

  // Search profiles (excluding a specific user ID if needed)
  async searchProfiles(query: string, excludeUserId?: string): Promise<Profile[]> {
    try {
      let q = supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`);

      if (excludeUserId) {
        q = q.neq('id', excludeUserId);
      }

      const { data, error } = await q.limit(20);
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error searching profiles:', err);
      return [];
    }
  },

  // Suggest default profiles (for discover tab when search is empty, excluding current user)
  async getSuggestedProfiles(excludeUserId?: string): Promise<Profile[]> {
    try {
      let q = supabase
        .from('profiles')
        .select('*')
        .eq('profile_completed', true);

      if (excludeUserId) {
        q = q.neq('id', excludeUserId);
      }

      const { data, error } = await q.limit(10);
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching suggested profiles:', err);
      return [];
    }
  },
};
