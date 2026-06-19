import { supabase } from '@/lib/supabase';
import { Vibe } from '@/types';

export const musicService = {
  // Fetch all vibes shared by users, including their user profiles
  async getVibes(): Promise<Vibe[]> {
    try {
      const { data, error } = await supabase
        .from('vibes')
        .select(`
          *,
          user:profiles (
            id,
            display_name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching vibes:', err);
      return [];
    }
  },

  // Share a new song/vibe
  async shareVibe(vibe: Omit<Vibe, 'id' | 'created_at'>): Promise<Vibe | null> {
    try {
      const { data, error } = await supabase
        .from('vibes')
        .insert(vibe)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error sharing vibe:', err);
      return null;
    }
  },

  // Save / Favorite a vibe (persists locally in localStorage as a helper)
  toggleFavoriteVibe(vibeId: string): string[] {
    try {
      const favorites = localStorage.getItem('favorited_vibes');
      let favList: string[] = favorites ? JSON.parse(favorites) : [];

      if (favList.includes(vibeId)) {
        favList = favList.filter((id) => id !== vibeId);
      } else {
        favList.push(vibeId);
      }

      localStorage.setItem('favorited_vibes', JSON.stringify(favList));
      return favList;
    } catch (err) {
      console.error('Error toggling favorite vibe:', err);
      return [];
    }
  },

  // Get favorited vibes IDs
  getFavoriteVibes(): string[] {
    try {
      const favorites = localStorage.getItem('favorited_vibes');
      return favorites ? JSON.parse(favorites) : [];
    } catch (err) {
      console.error('Error loading favorite vibes:', err);
      return [];
    }
  },
};
