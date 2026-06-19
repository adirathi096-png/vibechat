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

  // Search tracks on iTunes Search API (formerly Audius)
  async searchAudiusTracks(query: string): Promise<any[]> {
    if (!query.trim()) return [];
    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=25`
      );
      if (!response.ok) throw new Error('iTunes Search failed');
      const json = await response.json();
      const tracks = json.results || [];

      return tracks.map((track: any) => ({
        id: (track.trackId || Math.random().toString()).toString(),
        title: track.trackName || 'Unknown Title',
        artist: track.artistName || 'Unknown Artist',
        coverUrl: (track.artworkUrl100 || '').replace('/100x100bb.jpg', '/600x600bb.jpg') || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&h=300&q=80',
        streamUrl: track.previewUrl || '',
      })).filter((track: any) => track.streamUrl !== ''); // Ensure we only return playable preview tracks
    } catch (err) {
      console.error('Error searching iTunes tracks:', err);
      return [];
    }
  },

  // Get trending tracks on iTunes API
  async getTrendingTracks(): Promise<any[]> {
    try {
      // Query popular Bollywood hits (e.g. Arijit Singh) to populate initial suggestions
      const response = await fetch(
        `https://itunes.apple.com/search?term=Arijit+Singh&media=music&limit=15`
      );
      if (!response.ok) throw new Error('Fetching trending failed');
      const json = await response.json();
      const tracks = json.results || [];

      return tracks.map((track: any) => ({
        id: (track.trackId || Math.random().toString()).toString(),
        title: track.trackName || 'Unknown Title',
        artist: track.artistName || 'Unknown Artist',
        coverUrl: (track.artworkUrl100 || '').replace('/100x100bb.jpg', '/600x600bb.jpg') || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&h=300&q=80',
        streamUrl: track.previewUrl || '',
      })).filter((track: any) => track.streamUrl !== '');
    } catch (err) {
      console.error('Error fetching trending iTunes tracks:', err);
      return [];
    }
  },
};

