import { useState } from 'react';
import { useAuthStore } from './useAuth';
import { profileService } from '@/services/profileService';
import { Profile } from '@/types';

export const useProfile = () => {
  const { user, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Complete profile onboarding flow
  const completeProfile = async (profileData: {
    display_name: string;
    username: string;
    bio: string;
    avatar_url: string;
    college?: string;
    interests?: string[];
  }): Promise<Profile | null> => {
    if (!user) {
      setError('No authenticated user found');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate username format
      const formattedUsername = profileData.username.toLowerCase().replace(/\s+/g, '').trim();
      if (!formattedUsername) {
        throw new Error('Username cannot be empty');
      }

      // Check username availability
      const isAvailable = await profileService.isUsernameAvailable(formattedUsername, user.id);
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }

      // Save profile and mark as complete
      const completedProfile = await profileService.saveProfile({
        id: user.id,
        display_name: profileData.display_name,
        username: formattedUsername,
        bio: profileData.bio,
        avatar_url: profileData.avatar_url,
        college: profileData.college || null,
        interests: profileData.interests || [],
        profile_completed: true,
      });

      // Update auth store profile
      setProfile(completedProfile);
      return completedProfile;
    } catch (err: any) {
      console.error('Error completing profile:', err);
      setError(err.message || 'Failed to complete profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update existing profile (from profile edit page)
  const updateProfile = async (profileData: Partial<Profile>): Promise<Profile | null> => {
    if (!user) {
      setError('No authenticated user found');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      if (profileData.username) {
        const formattedUsername = profileData.username.toLowerCase().replace(/\s+/g, '').trim();
        const isAvailable = await profileService.isUsernameAvailable(formattedUsername, user.id);
        if (!isAvailable) {
          throw new Error('Username is already taken');
        }
        profileData.username = formattedUsername;
      }

      const updated = await profileService.saveProfile({
        id: user.id,
        ...profileData,
      });

      setProfile(updated);
      return updated;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    completeProfile,
    updateProfile,
    loading,
    error,
    setError,
  };
};
