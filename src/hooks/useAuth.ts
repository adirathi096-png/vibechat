import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';
import { Profile } from '@/types';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  initAuth: () => Promise<void>;
  setProfile: (profile: Profile | null) => void;
  setError: (error: string | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  error: null,

  setProfile: (profile) => set({ profile }),
  setError: (error) => set({ error }),

  initAuth: async () => {
    // Prevent duplicate initializations
    if (get().initialized && !get().loading) return;

    try {
      set({ loading: true });
      const session = await authService.getSession();
      const user = session?.user || null;
      let profile: Profile | null = null;

      if (user) {
        profile = await profileService.getProfile(user.id);
      }

      set({
        user,
        profile,
        loading: false,
        initialized: true,
      });

      // Set up listener for session changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        const currentUser = session?.user || null;
        let currentProfile: Profile | null = null;

        if (currentUser) {
          currentProfile = await profileService.getProfile(currentUser.id);
        }

        set({
          user: currentUser,
          profile: currentProfile,
          loading: false,
          initialized: true,
        });
      });
    } catch (err: any) {
      console.error('Error initializing authentication:', err);
      set({
        user: null,
        profile: null,
        loading: false,
        initialized: true,
        error: err.message || 'Initialization failed',
      });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await authService.signOut();
      set({ user: null, profile: null, loading: false, error: null });
    } catch (err: any) {
      console.error('Error signing out:', err);
      set({ loading: false, error: err.message || 'Logout failed' });
    }
  },
}));

// Export simple hook helper
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    profile: store.profile,
    loading: store.loading,
    initialized: store.initialized,
    error: store.error,
    initAuth: store.initAuth,
    signOut: store.signOut,
    setProfile: store.setProfile,
    setError: store.setError,
  };
};
