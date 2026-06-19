import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Award, Edit2, Check, X, Headphones, BookOpen, Music } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';

const PRESET_AVATARS = [
  { id: 'av1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80', name: 'Alex' },
  { id: 'av2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80', name: 'Mia' },
  { id: 'av3', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80', name: 'Kabir' },
  { id: 'av4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80', name: 'James' },
  { id: 'av5', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80', name: 'Neha' },
  { id: 'av6', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&h=120&q=80', name: 'Aman' },
];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { updateProfile, loading: saving, error, setError } = useProfile();

  const [vibeCount, setVibeCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [college, setCollege] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Fetch user vibe count
  const loadVibeCount = async () => {
    if (!profile?.id) return;
    try {
      const { count } = await supabase
        .from('vibes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id);

      setVibeCount(count || 0);
    } catch (err) {
      console.error('Error fetching vibe count:', err);
    }
  };

  useEffect(() => {
    loadVibeCount();
    
    // Sync local form state with profile state
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setCollege(profile.college || '');
      setAvatarUrl(profile.avatar_url || PRESET_AVATARS[0].url);
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Display Name cannot be empty.');
      return;
    }

    const res = await updateProfile({
      display_name: displayName.trim(),
      bio: bio.trim(),
      college: college.trim() || null,
      avatar_url: avatarUrl,
    });

    if (res) {
      setIsEditing(false);
      loadVibeCount();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex-1 p-5 bg-slate-50 dark:bg-dark-bg space-y-6 pb-12 page-transition relative">
      
      {/* Top Banner Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">
          My Profile
        </h2>
        
        <button
          onClick={() => navigate('/app/settings')}
          className="p-2 rounded-xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border text-slate-500 dark:text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* User Card */}
      <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-3xl p-5 shadow-sm text-center relative">
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-dark-bg dark:hover:bg-slate-850 text-slate-500 hover:text-slate-850 transition-colors cursor-pointer"
          title="Edit Profile"
        >
          <Edit2 size={14} />
        </button>

        {/* Profile Avatar */}
        <div className="mx-auto w-20 h-20 rounded-3xl overflow-hidden bg-slate-150 border-2 border-brand flex items-center justify-center shadow-md">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <User size={36} className="text-slate-400" />
          )}
        </div>

        <h3 className="mt-4 text-sm font-bold text-slate-800 dark:text-slate-200">
          {profile?.display_name || 'VibeUser'}
        </h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium font-outfit">
          @{profile?.username || 'user'}
        </p>

        {profile?.bio && (
          <p className="mt-4 px-2 text-xs text-slate-655 dark:text-slate-400 leading-relaxed font-medium">
            {profile.bio}
          </p>
        )}

        {profile?.college && (
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-dark-bg border border-slate-150 dark:border-dark-border/40 rounded-full text-[9px] text-slate-500 dark:text-slate-400 font-bold">
            <BookOpen size={10} />
            <span>{profile.college}</span>
          </div>
        )}

        {/* User Stats Grid */}
        <div className="mt-6 pt-5 border-t border-slate-50 dark:border-dark-border/50 grid grid-cols-2 gap-4">
          <div className="text-center">
            <span className="block text-lg font-bold text-slate-800 dark:text-slate-200 font-display">
              {vibeCount}
            </span>
            <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
              My Vibes
            </span>
          </div>
          <div className="text-center border-l border-slate-50 dark:border-dark-border/50">
            <span className="block text-lg font-bold text-slate-800 dark:text-slate-200 font-display">
              {profile?.interests?.length || 0}
            </span>
            <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
              Interests
            </span>
          </div>
        </div>
      </div>

      {/* Interests list */}
      {profile?.interests && profile.interests.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Interests
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.map((tag) => (
              <span
                key={tag}
                className="px-3.5 py-1.5 rounded-full bg-white dark:bg-dark-card border border-slate-150 dark:border-dark-border/60 text-xs font-medium text-slate-600 dark:text-slate-350 shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full mt-4 py-3 px-4 border border-red-200 dark:border-red-950/20 rounded-2xl text-xs font-bold text-red-500 bg-red-500/5 hover:bg-red-500/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
      >
        <LogOut size={16} />
        <span>Log Out</span>
      </button>

      {/* Edit Profile Drawer / Modal Overlay */}
      {isEditing && (
        <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-30 flex flex-col justify-end">
          <div className="bg-white dark:bg-dark-card border-t border-slate-150 dark:border-dark-border rounded-t-3xl max-h-[85%] overflow-y-auto p-5 space-y-4 shadow-2xl animate-slideUp">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-border pb-3">
              <div className="flex items-center gap-1.5">
                <Edit2 size={16} className="text-yellow-500" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 font-display">
                  Edit Profile Details
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-xl bg-slate-50 dark:bg-dark-bg text-slate-500 hover:text-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-655 text-xs rounded-2xl flex items-center gap-2">
                <X size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Preset avatar select */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Update Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatarUrl(av.url)}
                      className={`relative rounded-xl overflow-hidden border-2 aspect-square transition-all cursor-pointer ${
                        avatarUrl === av.url ? 'border-brand' : 'border-transparent opacity-65'
                      }`}
                    >
                      <img src={av.url} alt="" className="w-full h-full object-cover" />
                      {avatarUrl === av.url && (
                        <div className="absolute inset-0 bg-brand/10 flex items-center justify-center">
                          <Check size={10} strokeWidth={3} className="text-slate-900" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="block w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                  required
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="block w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-brand resize-none"
                  maxLength={150}
                />
              </div>

              {/* College */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  College / School
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="block w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-4 py-3 px-4 border border-transparent rounded-2xl shadow-sm text-xs font-bold text-slate-900 bg-brand hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-slate-900/35 border-t-slate-900 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Save Changes</span>
                    <Check size={14} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
