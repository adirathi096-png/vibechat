import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Plus, Heart, ExternalLink, MessageCircle, X, Headphones, Radio, Sparkles, Play, Pause, Search, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { musicService } from '@/services/musicService';
import { chatService } from '@/services/chatService';
import { Vibe } from '@/types';

const MOODS = ['Chill', 'Night Drive', 'Study', 'Party', 'Sad', 'Energetic'];

const MOOD_COVERS: Record<string, string> = {
  'Chill': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&h=300&q=80',
  'Night Drive': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&h=300&q=80',
  'Study': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&h=300&q=80',
  'Party': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&h=300&q=80',
  'Sad': 'https://images.unsplash.com/photo-1437419764061-2473afe69fc2?auto=format&fit=crop&w=300&h=300&q=80',
  'Energetic': 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=300&h=300&q=80',
};

const MusicFeed: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const audioPlayer = useAudioPlayer();
  
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [trendingTracks, setTrendingTracks] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<any | null>(null);
  
  const [mood, setMood] = useState(MOODS[0]);
  const [description, setDescription] = useState('');
  const [posting, setPosting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const list = await musicService.getVibes();
      setVibes(list);
      setFavorites(musicService.getFavoriteVibes());
    } catch (err) {
      console.error('Error loading vibes feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  // Sync modal lifecycle with API calls
  useEffect(() => {
    if (isModalOpen) {
      const loadTrending = async () => {
        const tracks = await musicService.getTrendingTracks();
        setTrendingTracks(tracks);
      };
      loadTrending();
    } else {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedTrack(null);
      setDescription('');
    }
  }, [isModalOpen]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await musicService.searchAudiusTracks(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleFavoriteToggle = (vibeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = musicService.toggleFavoriteVibe(vibeId);
    setFavorites(updated);
  };

  const handleQuickChat = async (targetUserId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile?.id) return;
    try {
      const convoId = await chatService.getOrCreateDirectChat(profile.id, targetUserId);
      if (convoId) {
        navigate(`/app/chats/${convoId}`);
      }
    } catch (err) {
      console.error('Error in Quick Chat:', err);
    }
  };

  const handleShareVibeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    if (!selectedTrack) {
      setModalError('Please search and select a song vibe first.');
      return;
    }

    setPosting(true);
    setModalError(null);

    try {
      const shared = await musicService.shareVibe({
        user_id: profile.id,
        title: description.trim() || `Listening to ${selectedTrack.title}`,
        description: description.trim() || null,
        mood,
        song_title: selectedTrack.title,
        artist_name: selectedTrack.artist,
        cover_url: selectedTrack.coverUrl,
        external_url: selectedTrack.streamUrl,
      });

      if (shared) {
        setIsModalOpen(false);
        loadFeed(); // Refresh feed
      }
    } catch (err: any) {
      console.error('Error posting vibe:', err);
      setModalError(err.message || 'Failed to post vibe. Try again.');
    } finally {
      setPosting(false);
    }
  };


  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-bg page-transition relative min-h-0">
      
      {/* Title Header */}
      <div className="p-4 bg-white dark:bg-dark-bg border-b border-slate-100 dark:border-dark-border flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">
            Vibe Lounge
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Discover and share song snippets with friends
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-2xl bg-brand hover:bg-brand-light text-slate-900 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
        >
          <Plus size={16} />
          <span>Share Vibe</span>
        </button>
      </div>

      {/* Feed list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-5 h-5 rounded-full border-2 border-brand/20 border-t-brand animate-spin mx-auto mb-2"></div>
            <span className="text-[10px] font-semibold font-outfit tracking-wider uppercase">Loading soundscapes</span>
          </div>
        ) : vibes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-full flex items-center justify-center text-slate-350 dark:text-slate-655 shadow-sm mb-4">
              <Headphones size={28} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-250 font-display text-sm">
              The Lounge is quiet...
            </h3>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed">
              No one has posted their vibes today. Be the first to start the music feed!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-brand hover:bg-brand-light text-slate-900 text-xs font-bold rounded-2xl cursor-pointer"
            >
              <Plus size={14} />
              <span>Share a song</span>
            </button>
          </div>
        ) : (
          vibes.map((v) => {
            const isFav = favorites.includes(v.id);
            const isMe = v.user_id === profile?.id;
            return (
              <div
                key={v.id}
                className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-3xl overflow-hidden shadow-sm flex flex-col"
              >
                {/* User Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-250 shrink-0">
                      <img src={v.user?.avatar_url || ''} alt={v.user?.display_name || ''} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {v.user?.display_name}
                      </h4>
                      <p className="text-[9px] text-slate-450 dark:text-slate-500">
                        @{v.user?.username}
                      </p>
                    </div>
                  </div>

                  {v.mood && (
                    <span className="text-[9px] font-bold text-yellow-600 dark:text-yellow-450 bg-yellow-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {v.mood}
                    </span>
                  )}
                </div>

                {/* Vibe Song details container */}
                <div className="px-4 pb-3 flex gap-3">
                  <div
                    onClick={() => audioPlayer.playVibe(v)}
                    className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-dark-bg shrink-0 shadow-sm relative cursor-pointer group/cover"
                  >
                    <img src={v.cover_url || ''} alt="" className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-300" />
                    <div className={`absolute inset-0 flex items-center justify-center transition-colors duration-200 ${
                      audioPlayer.currentVibeId === v.id ? 'bg-black/45' : 'bg-black/25 group-hover/cover:bg-black/40'
                    }`}>
                      {audioPlayer.currentVibeId === v.id && audioPlayer.isPlaying ? (
                        <div className="flex items-end gap-0.5 h-3">
                          <span className="eq-bar"></span>
                          <span className="eq-bar"></span>
                          <span className="eq-bar"></span>
                          <span className="eq-bar"></span>
                        </div>
                      ) : (
                        <Play size={16} className="text-brand fill-brand" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h5 className="text-xs font-bold text-slate-850 dark:text-slate-150 truncate leading-snug">
                      {v.song_title}
                    </h5>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-snug mt-0.5">
                      {v.artist_name}
                    </p>
                  </div>
                </div>

                {/* Vibe comment description */}
                {v.description && (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium bg-slate-50/50 dark:bg-dark-bg/60 p-3 rounded-2xl border border-slate-100 dark:border-dark-border/40">
                      {v.description}
                    </p>
                  </div>
                )}

                {/* Action buttons footer */}
                <div className="px-4 py-3 bg-slate-50/30 dark:bg-dark-card/50 border-t border-slate-100 dark:border-dark-border/50 flex items-center justify-between">
                  <div className="flex gap-4">
                    {/* Favorite/Save Toggle */}
                    <button
                      onClick={(e) => handleFavoriteToggle(v.id, e)}
                      className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors cursor-pointer ${
                        isFav 
                          ? 'text-red-500' 
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                      }`}
                    >
                      <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                      <span>{isFav ? 'Saved' : 'Save'}</span>
                    </button>

                    {/* Quick Direct Chat with sender */}
                    {!isMe && (
                      <button
                        onClick={(e) => handleQuickChat(v.user_id, e)}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer"
                      >
                        <MessageCircle size={16} />
                        <span>Chat vibe</span>
                      </button>
                    )}
                  </div>

                  {/* External player redirect */}
                  {v.external_url && (
                    <button
                      onClick={() => audioPlayer.playVibe(v)}
                      className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-brand-dark dark:hover:text-brand cursor-pointer"
                    >
                      <span>{audioPlayer.currentVibeId === v.id && audioPlayer.isPlaying ? 'Playing' : 'Listen'}</span>
                      <ExternalLink size={12} />
                    </button>
                  )}
                </div>

              </div>
            );
          }))}
      </div>

      {/* Share Vibe Slide-Up Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-30 flex flex-col justify-end">
          <div className="bg-white dark:bg-dark-card border-t border-slate-100 dark:border-dark-border rounded-t-3xl max-h-[90%] overflow-y-auto p-5 space-y-4 shadow-2xl animate-slideUp">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-border pb-3">
              <div className="flex items-center gap-1.5">
                <Music size={18} className="text-yellow-500" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 font-display">
                  Share your song vibe
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl bg-slate-50 dark:bg-dark-bg text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-655 text-xs rounded-2xl flex items-center gap-2">
                <X size={14} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {!selectedTrack ? (
              // SEARCH SONG VIEW
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Search Songs on Audius
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={16} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="e.g. Chill vibes, Lofi beats, Alan Walker..."
                      className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {searchQuery ? 'Search Results' : 'Trending Free Tracks 🔥'}
                  </h4>

                  {searching ? (
                    <div className="py-8 text-center text-slate-400">
                      <div className="w-5 h-5 rounded-full border-2 border-brand/20 border-t-brand animate-spin mx-auto mb-2"></div>
                      <span className="text-[9px]">Searching database...</span>
                    </div>
                  ) : (searchQuery ? searchResults : trendingTracks).length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-450 dark:text-slate-500">
                      No songs found. Try checking your spelling or search terms.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                      {(searchQuery ? searchResults : trendingTracks).map((track: any) => {
                        const previewId = `preview-${track.title}-${track.artist}`;
                        const isCurrentPreview = audioPlayer.currentVibeId === previewId;
                        const isPreviewPlaying = isCurrentPreview && audioPlayer.isPlaying;

                        return (
                          <div
                            key={track.id}
                            onClick={() => setSelectedTrack(track)}
                            className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/50 hover:bg-slate-100/70 dark:bg-dark-bg/30 dark:hover:bg-dark-bg/80 border border-slate-100/50 dark:border-dark-border/40 cursor-pointer transition-all hover:scale-[100.5%]"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 shrink-0 shadow-sm relative group/btn">
                                <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{track.title}</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-550 truncate mt-0.5">{track.artist}</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                audioPlayer.playTrackPreview(track.title, track.artist, track.coverUrl, track.streamUrl);
                              }}
                              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                isPreviewPlaying
                                  ? 'bg-brand/10 border-brand text-brand-dark dark:text-brand'
                                  : 'bg-white dark:bg-dark-card border-slate-100 dark:border-dark-border text-slate-400 dark:text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {isPreviewPlaying ? (
                                <div className="flex items-end gap-0.5 h-3">
                                  <span className="w-0.5 h-2 bg-brand animate-[bounce-eq_0.8s_ease-in-out_infinite_alternate]"></span>
                                  <span className="w-0.5 h-2 bg-brand animate-[bounce-eq_0.8s_ease-in-out_infinite_alternate_0.15s]"></span>
                                  <span className="w-0.5 h-2 bg-brand animate-[bounce-eq_0.8s_ease-in-out_infinite_alternate_0.3s]"></span>
                                </div>
                              ) : (
                                <Play size={12} fill="currentColor" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // SELECTED SONG DETAILS & DESCRIPTION POST FORM
              <form onSubmit={handleShareVibeSubmit} className="space-y-4">
                {/* Chosen track banner */}
                <div className="p-3.5 bg-slate-50 dark:bg-dark-bg/60 border border-slate-150 dark:border-dark-border/80 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 shadow-sm relative">
                      <img src={selectedTrack.coverUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-black text-brand-dark dark:text-brand uppercase tracking-wider">Vibe selected</span>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate mt-0.5 leading-snug">{selectedTrack.title}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{selectedTrack.artist}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTrack(null)}
                    className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 text-[10px] font-bold border border-red-100 dark:bg-red-950/20 dark:border-red-900/30 transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* Mood picker */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Select Vibe Mood
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {MOODS.map((m) => {
                      const isActive = mood === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMood(m)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-brand text-slate-900 shadow-sm border border-brand'
                              : 'bg-slate-50 dark:bg-dark-bg text-slate-500 border border-slate-200 dark:border-dark-border/40 hover:bg-slate-100'
                          }`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Write something... (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="This vibe hits different in the rain 🌧️✨"
                    rows={3}
                    className="block w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-brand resize-none"
                    maxLength={200}
                  />
                </div>

                <button
                  type="submit"
                  disabled={posting}
                  className="w-full mt-4 py-3 px-4 border border-transparent rounded-2xl shadow-sm text-xs font-bold text-slate-900 bg-brand hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {posting ? (
                    <div className="w-4 h-4 border-2 border-slate-900/35 border-t-slate-900 rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Publish Vibe</span>
                      <Sparkles size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default MusicFeed;

