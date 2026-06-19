import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Radio, Music, Search, ArrowRight, UserPlus, Music2, Headphones, Heart, Sparkles, Plus, Users, Play, Pause } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { musicService } from '@/services/musicService';
import { voiceService } from '@/services/voiceService';
import { friendService } from '@/services/friendService';
import { chatService } from '@/services/chatService';
import { Profile, Vibe, VoiceRoom, Conversation } from '@/types';


const VIBE_CATEGORIES = ['All', 'Chill', 'Night Drive', 'Study', 'Party', 'Sad', 'Energetic'];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const audioPlayer = useAudioPlayer();
  
  const [friends, setFriends] = useState<Profile[]>([]);
  const [recentChats, setRecentChats] = useState<Conversation[]>([]);
  const [allVibes, setAllVibes] = useState<Vibe[]>([]);
  const [filteredVibes, setFilteredVibes] = useState<Vibe[]>([]);
  const [activeRooms, setActiveRooms] = useState<VoiceRoom[]>([]);
  const [selectedTag, setSelectedTag] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!profile?.id) return;
    try {
      const [friendsList, chatsList, vibesList, roomsList] = await Promise.all([
        friendService.getFriends(profile.id),
        chatService.getConversations(profile.id),
        musicService.getVibes(),
        voiceService.getActiveRooms(),
      ]);

      setFriends(friendsList);
      setRecentChats(chatsList.slice(0, 3));
      setAllVibes(vibesList);
      setFilteredVibes(vibesList);
      setActiveRooms(roomsList.slice(0, 2));
      setFavorites(musicService.getFavoriteVibes());
    } catch (err) {
      console.error('Error fetching home dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile?.id]);

  // Handle vibe category filter changes
  useEffect(() => {
    if (selectedTag === 'All') {
      setFilteredVibes(allVibes.slice(0, 6));
    } else {
      const filtered = allVibes.filter(
        (v) => v.mood?.toLowerCase().trim() === selectedTag.toLowerCase().trim()
      );
      setFilteredVibes(filtered.slice(0, 6));
    }
  }, [selectedTag, allVibes]);

  const handleFavoriteToggle = (vibeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = musicService.toggleFavoriteVibe(vibeId);
    setFavorites(updated);
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-dark-bg text-slate-500 dark:text-slate-400">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-yellow-100 dark:border-yellow-950"></div>
          <div className="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-xs font-semibold tracking-wider font-outfit uppercase animate-pulse">Syncing soundscapes...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-5 space-y-6 bg-slate-50 dark:bg-dark-bg pb-16 page-transition">
      
      {/* Search Input Card */}
      <div 
        onClick={() => navigate('/app/discover')}
        className="w-full py-3.5 px-4.5 rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border text-slate-400 dark:text-slate-500 text-xs flex items-center gap-3 cursor-pointer shadow-sm hover:shadow transition-all duration-200"
      >
        <Search size={16} className="text-slate-405 dark:text-slate-500" />
        <span className="font-medium">Search users, music feeds, or active lounge chats...</span>
      </div>

      {/* Active Friends Stories */}
      <div>
        <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-3 font-display">
          Active Friends
        </h3>

        {friends.length === 0 ? (
          <div className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-3xl shadow-sm">
            <button
              onClick={() => navigate('/app/discover')}
              className="w-11 h-11 rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border/60 hover:border-brand/40 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 transition-all shrink-0 cursor-pointer"
            >
              <UserPlus size={18} />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-snug">No active feeds</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">
                Search and connect with friends to see their active vibe channels.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-1.5 scrollbar-none">
            {friends.map((friend) => (
              <div
                key={friend.id}
                onClick={async () => {
                  if (profile?.id) {
                    const cid = await chatService.getOrCreateDirectChat(profile.id, friend.id);
                    if (cid) navigate(`/app/chats/${cid}`);
                  }
                }}
                className="flex flex-col items-center text-center shrink-0 cursor-pointer group"
              >
                <div className="relative w-12 h-12 rounded-2xl p-0.5 story-ring-active">
                  <div className="w-full h-full rounded-[14px] overflow-hidden bg-white dark:bg-dark-bg border border-white dark:border-dark-bg">
                    {friend.avatar_url ? (
                      <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-brand/10 text-slate-800 dark:text-brand-light">
                        {friend.display_name?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-dark-bg"></div>
                </div>
                <span className="text-[10px] mt-1.5 font-bold text-slate-650 dark:text-slate-400 truncate max-w-[55px] group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                  {friend.display_name?.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's Vibes Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 tracking-wider uppercase font-display flex items-center gap-1.5">
            <Headphones size={15} className="text-yellow-500 animate-pulse-slow" />
            <span>Today's Vibes</span>
          </h3>
          <Link
            to="/app/music"
            className="text-[10px] font-bold text-slate-400 hover:text-brand-dark dark:hover:text-brand transition-colors"
          >
            Go to Lounge &rarr;
          </Link>
        </div>

        {/* Category swiper filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none justify-start">
          {VIBE_CATEGORIES.map((tag) => {
            const isActive = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-brand text-slate-900 shadow-sm border border-brand'
                    : 'bg-white dark:bg-dark-card text-slate-450 dark:text-slate-400 border border-slate-100 dark:border-dark-border/40 hover:bg-slate-50'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {filteredVibes.length === 0 ? (
          <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-3xl p-6 text-center shadow-sm">
            <Music2 size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 dark:text-slate-505 font-medium">
              No shared song vibes under "{selectedTag}" category today.
            </p>
            <button
              onClick={() => navigate('/app/music')}
              className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand hover:bg-brand-light text-slate-900 text-xs font-bold rounded-2xl cursor-pointer shadow-sm transition-colors"
            >
              <Plus size={14} />
              <span>Post a vibe</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {filteredVibes.map((vibe) => {
              const isFav = favorites.includes(vibe.id);
              const isCurrent = audioPlayer.currentVibeId === vibe.id;
              const isPlaying = isCurrent && audioPlayer.isPlaying;
              return (
                <div
                  key={vibe.id}
                  onClick={() => navigate('/app/music')}
                  className="bg-white dark:bg-dark-card border border-slate-105/60 dark:border-dark-border rounded-[22px] p-3 shadow-sm hover:scale-[101.5%] transition-all duration-200 cursor-pointer relative group flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Visual Card Cover */}
                    <div className="w-full aspect-square rounded-[18px] overflow-hidden bg-slate-100 dark:bg-dark-bg mb-2.5 relative shadow-inner">
                      <img src={vibe.cover_url || ''} alt={vibe.song_title || ''} className="w-full h-full object-cover" />
                      
                      {/* Dark Vignette Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/55" />

                      {/* Play/Pause Overlay */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          audioPlayer.playVibe(vibe);
                        }}
                        className="absolute inset-0 flex items-center justify-center transition-colors duration-250 bg-black/10 group-hover:bg-black/45"
                      >
                        {isPlaying ? (
                          <div className="flex items-end gap-0.5 h-3">
                            <span className="eq-bar"></span>
                            <span className="eq-bar"></span>
                            <span className="eq-bar"></span>
                            <span className="eq-bar"></span>
                          </div>
                        ) : (
                          <Play size={18} className="text-brand fill-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>

                      {/* Favorite Button Overlay */}
                      <button
                        onClick={(e) => handleFavoriteToggle(vibe.id, e)}
                        className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer z-10 ${
                          isFav ? 'bg-red-500 text-white' : 'bg-black/40 hover:bg-black/60 text-white'
                        }`}
                      >
                        <Heart size={12} fill={isFav ? 'currentColor' : 'none'} />
                      </button>

                      {vibe.mood && (
                        <div className="absolute bottom-2 left-2 bg-yellow-400 text-slate-950 px-2 py-0.5 rounded-md text-[8px] font-black tracking-wider uppercase z-10">
                          {vibe.mood}
                        </div>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-snug">
                      {vibe.song_title}
                    </h4>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 truncate leading-snug mt-0.5">
                      {vibe.artist_name}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-50 dark:border-dark-border/40 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img src={vibe.user?.avatar_url || ''} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">
                      @{vibe.user?.username}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Voice lounges Previews */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 tracking-wider uppercase font-display">
            Voice Lounges
          </h3>
          <Link
            to="/app/voice"
            className="text-[10px] font-bold text-slate-400 hover:text-brand-dark dark:hover:text-brand transition-colors"
          >
            All Lounges &rarr;
          </Link>
        </div>

        {activeRooms.length === 0 ? (
          <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-3xl p-6 text-center shadow-sm">
            <Radio size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 dark:text-slate-505 font-medium">
              No live voice rooms active.
            </p>
            <button
              onClick={() => navigate('/app/voice')}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand hover:bg-brand-light text-slate-900 text-xs font-bold rounded-2xl cursor-pointer shadow-sm transition-colors"
            >
              <span>Host lounge</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {activeRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => navigate('/app/voice')}
                className="bg-white dark:bg-dark-card border border-slate-100/60 dark:border-dark-border rounded-3xl p-4 shadow-sm hover:border-brand/40 transition-all cursor-pointer relative"
              >
                {/* Live equalizer indicator */}
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="eq-bar"></span>
                    <span className="eq-bar"></span>
                    <span className="eq-bar"></span>
                    <span className="eq-bar"></span>
                  </div>
                  <span className="text-[8px] font-black text-brand-dark dark:text-brand uppercase tracking-wider">Live</span>
                </div>

                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 leading-snug">
                  {room.title}
                </h4>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-2 min-h-6 leading-relaxed">
                  {room.description || 'Join speakers to talk music and vibes.'}
                </p>

                <div className="mt-3.5 pt-2.5 border-t border-slate-50 dark:border-dark-border/40 flex items-center justify-between text-[8px] text-slate-400">
                  <span className="font-bold">By @{room.host?.username}</span>
                  <div className="flex items-center gap-1 bg-yellow-400/10 text-brand-dark dark:text-brand px-1.5 py-0.5 rounded font-black">
                    <Users size={10} />
                    <span>{room.membersCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Chats thread preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 tracking-wider uppercase font-display">
            Recent Chats
          </h3>
          <Link
            to="/app/chats"
            className="text-[10px] font-bold text-slate-400 hover:text-brand-dark dark:hover:text-brand transition-colors"
          >
            All Chats &rarr;
          </Link>
        </div>

        {recentChats.length === 0 ? (
          <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-3xl p-6 text-center shadow-sm">
            <MessageCircle size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 dark:text-slate-505 font-medium">
              No conversations active.
            </p>
            <button
              onClick={() => navigate('/app/discover')}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand hover:bg-brand-light text-slate-900 text-xs font-bold rounded-2xl cursor-pointer shadow-sm transition-colors"
            >
              <span>Connect with people</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentChats.map((c) => {
              const otherUser = c.members?.find((m) => m.id !== profile?.id);
              if (!otherUser) return null;
              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/app/chats/${c.id}`)}
                  className="flex items-center justify-between p-3.5 bg-white dark:bg-dark-card border border-slate-100/60 dark:border-dark-border rounded-2xl shadow-sm hover:border-brand/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-200 border border-slate-100 dark:border-dark-border shrink-0">
                      <img src={otherUser.avatar_url || ''} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {otherUser.display_name}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {c.lastMessage?.content || 'Tap to text...'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 dark:text-slate-600 shrink-0 ml-2" />
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;
