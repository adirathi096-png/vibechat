import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export const authService = {
  // Get current active session
  async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (err) {
      console.error('Error fetching session:', err);
      return null;
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (err) {
      console.error('Error fetching user:', err);
      return null;
    }
  },

  // Sign up with email and password
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) throw error;
    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Password reset email request
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/app/settings`,
    });
    if (error) throw error;
    return data;
  },

  // Set up auth state change listener
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return subscription;
  },
};
