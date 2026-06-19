import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, User, Sparkles, Plus, Check } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

const PRESET_AVATARS = [
  { id: 'av1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80', name: 'Alex' },
  { id: 'av2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80', name: 'Mia' },
  { id: 'av3', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80', name: 'Kabir' },
  { id: 'av4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80', name: 'James' },
  { id: 'av5', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80', name: 'Neha' },
  { id: 'av6', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&h=120&q=80', name: 'Aman' },
];

const SUGGESTED_INTERESTS = [
  'Lofi', 'Synthwave', 'Anime OST', 'Acoustic', 'Bollywood', 
  'Hip Hop', 'Rock', 'Techno', 'Podcast', 'Study', 'Night Drive', 'Party'
];

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { completeProfile, loading, error, setError } = useProfile();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [college, setCollege] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only lowercase and alphanumeric, no spaces
    const val = e.target.value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9._-]/g, '');
    setUsername(val);
  };

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleAddCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customInterest.trim();
    if (clean && !selectedInterests.includes(clean)) {
      setSelectedInterests([...selectedInterests, clean]);
      setCustomInterest('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Display Name is required.');
      return;
    }
    if (!username.trim() || username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    const res = await completeProfile({
      display_name: displayName.trim(),
      username: username.trim(),
      bio: bio.trim(),
      avatar_url: selectedAvatar,
      college: college.trim() || undefined,
      interests: selectedInterests,
    });

    if (res) {
      navigate('/app/home', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06080b] flex flex-col justify-center px-4 py-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-display">
          Complete Profile
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400 dark:text-slate-500 font-medium">
          Create your unique vibe personality
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-dark-card py-6 px-5 shadow-xl rounded-3xl border border-slate-100 dark:border-dark-border">
          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs leading-relaxed animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Select Avatar
              </label>
              
              <div className="flex justify-center mb-4">
                <div className="relative w-20 h-20 rounded-3xl overflow-hidden bg-slate-100 border-2 border-brand/50 flex items-center justify-center shadow-md">
                  <img
                    src={selectedAvatar}
                    alt="Active Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`relative rounded-xl overflow-hidden border-2 aspect-square transition-all duration-200 cursor-pointer ${
                      selectedAvatar === av.url
                        ? 'border-brand scale-105 shadow-sm'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:scale-102'
                    }`}
                  >
                    <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                    {selectedAvatar === av.url && (
                      <div className="absolute inset-0 bg-brand/10 flex items-center justify-center">
                        <div className="bg-brand rounded-full p-0.5 text-slate-900">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Aman Sharma"
                className="block w-full px-4 py-3 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-colors"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 text-sm font-medium font-outfit">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="aman.music"
                  className="block w-full pl-8 pr-4 py-3 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-colors"
                  required
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                Lowercase letters, numbers, periods, dashes, or underscores only. No spaces.
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Music is my therapy. Share your thoughts..."
                rows={2}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-colors resize-none"
              />
            </div>

            {/* College */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                College / School (Optional)
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="IIT Bombay"
                className="block w-full px-4 py-3 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-colors"
              />
            </div>

            {/* Interests tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Interests (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2 max-h-32 overflow-y-auto pr-1">
                {SUGGESTED_INTERESTS.map((tag) => {
                  const isSelected = selectedInterests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleInterestToggle(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-brand text-slate-900 shadow-sm border border-brand'
                          : 'bg-slate-50 dark:bg-dark-bg text-slate-500 dark:text-slate-400 border border-slate-150 dark:border-dark-border hover:bg-slate-100'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Interest */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  placeholder="Custom interest..."
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddCustomInterest}
                  className="px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-bg dark:hover:bg-slate-800 border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-350 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-slate-900 bg-brand hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Save and Finish</span>
                  <Sparkles size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
