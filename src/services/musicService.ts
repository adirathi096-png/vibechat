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

  // Search tracks on Audius API
  async searchAudiusTracks(query: string): Promise<any[]> {
    if (!query.trim()) return [];
    try {
      const response = await fetch(
        `https://api.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=VibeChat`
      );
      if (!response.ok) throw new Error('Search failed');
      const json = await response.json();
      const tracks = json.data || [];

      return tracks.map((track: any) => ({
        id: track.id,
        title: track.title,
        artist: track.user?.name || track.user?.handle || 'Unknown Artist',
        coverUrl: track.artwork?.['480x480'] || track.artwork?.['150x150'] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&h=300&q=80',
        streamUrl: `https://api.audius.co/v1/tracks/${track.id}/stream?app_name=VibeChat`,
      }));
    } catch (err) {
      console.error('Error searching Audius tracks:', err);
      return [];
    }
  },

  // Get trending tracks on Audius API
  async getTrendingTracks(): Promise<any[]> {
    try {
      const response = await fetch(
        `https://api.audius.co/v1/tracks/trending?limit=10&app_name=VibeChat`
      );
      if (!response.ok) throw new Error('Fetching trending failed');
      const json = await response.json();
      const tracks = json.data || [];

      return tracks.map((track: any) => ({
        id: track.id,
        title: track.title,
        artist: track.user?.name || track.user?.handle || 'Unknown Artist',
        coverUrl: track.artwork?.['480x480'] || track.artwork?.['150x150'] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&h=300&q=80',
        streamUrl: `https://api.audius.co/v1/tracks/${track.id}/stream?app_name=VibeChat`,
      }));
    } catch (err) {
      console.error('Error fetching trending Audius tracks:', err);
      return [];
    }
  },
};

