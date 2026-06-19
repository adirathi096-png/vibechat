import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Radio, Music, Search, ArrowRight, UserPlus, Music2, Headphones } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { musicService } from '@/services/musicService';
import { voiceService } from '@/services/voiceService';
import { friendService } from '@/services/friendService';
import { chatService } from '@/services/chatService';
import { Profile, Vibe, VoiceRoom, Conversation } from '@/types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [friends, setFriends] = useState<Profile[]>([]);
  const [recentChats, setRecentChats] = useState<Conversation[]>([]);
  const [todayVibes, setTodayVibes] = useState<Vibe[]>([]);
  const [activeRooms, setActiveRooms] = useState<VoiceRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [friendsList, chatsList, vibesList, roomsList] = await Promise.all([
          friendService.getFriends(profile.id),
          chatService.getConversations(profile.id),
          musicService.getVibes(),
          voiceService.getActiveRooms(),
        ]);

        setFriends(friendsList);
        setRecentChats(chatsList.slice(0, 3)); // show top 3
        setTodayVibes(vibesList.slice(0, 5)); // show top 5
        setActiveRooms(roomsList.slice(0, 2)); // show top 2
      } catch (err) {
        console.error('Error fetching home dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-dark-bg text-slate-500 dark:text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-brand/20 border-t-brand animate-spin mb-3"></div>
        <p className="text-xs font-semibold tracking-wider font-outfit uppercase">Assembling feeds...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-5 space-y-6 bg-slate-50 dark:bg-dark-bg pb-12 page-transition">
      
      {/* Search Bar Widget */}
      <div 
        onClick={() => navigate('/app/discover')}
        className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border text-slate-400 dark:text-slate-500 text-sm flex items-center gap-3 cursor-pointer shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
      >
        <Search size={18} />
        <span>Search users, songs, vibes...</span>
      </div>

      {/* Active Friends - horizontal story list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 font-display">
            Active Friends
          </h3>
          {friends.length > 0 && (
            <span className="text-[10px] bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">
              {friends.length} online
            </span>
          )}
        </div>

        {friends.length === 0 ? (
          <div className="flex items-center gap-3 py-1 overflow-x-auto">
            <button
              onClick={() => navigate('/app/discover')}
              className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 transition-all shrink-0 cursor-pointer"
            >
              <UserPlus size={18} />
            </button>
            <p className="text-xs text-slate-400 font-medium">
              Find friends to see active stories
            </p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-1.5 scrollbar-thin">
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
                      <img src={friend.avatar_url} alt={friend.display_name || ''} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-brand/10 text-slate-800">
                        {friend.display_name?.slice(0, 2).toUpperCase() || 'VC'}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-dark-bg"></div>
                </div>
                <span className="text-[10px] mt-1 font-semibold text-slate-600 dark:text-slate-400 max-w-[50px] truncate group-hover:text-slate-900 dark:group-hover:text-slate-100">
                  {friend.display_name?.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's Vibes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 font-display flex items-center gap-1.5">
            <Headphones size={16} className="text-yellow-500 animate-pulse-slow" />
            <span>Today's Vibes</span>
          </h3>
          <Link
            to="/app/music"
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-0.5"
          >
            <span>Feed</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {todayVibes.length === 0 ? (
          <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-3xl p-5 text-center shadow-sm">
            <Music2 size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              No vibes shared today yet.
            </p>
            <button
              onClick={() => navigate('/app/music')}
              className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-brand hover:bg-brand-light text-slate-900 text-xs font-bold rounded-2xl cursor-pointer"
            >
              <span>Share a vibe</span>
            </button>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-thin">
            {todayVibes.map((vibe) => (
              <div
                key={vibe.id}
                onClick={() => navigate('/app/music')}
                className="w-40 shrink-0 bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-3xl p-3 shadow-sm hover:scale-102 transition-transform cursor-pointer"
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-2 relative">
                  {vibe.cover_url ? (
                    <img src={vibe.cover_url} alt={vibe.song_title || ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-yellow-300 to-amber-500 flex items-center justify-center text-slate-900">
                      <Music size={24} />
                    </div>
                  )}
                  {vibe.mood && (
                    <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] text-white font-bold tracking-tight">
                      {vibe.mood}
                    </div>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-snug">
                  {vibe.song_title}
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-snug">
                  {vibe.artist_name}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-50 dark:border-dark-border flex items-center gap-1.5">
                  <div className="w-4.5 h-4.5 rounded-full overflow-hidden bg-slate-100">
                    <img src={vibe.user?.avatar_url || ''} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 truncate">
                    @{vibe.user?.username}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Chats widget */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 font-display">
            Recent Chats
          </h3>
          <Link
            to="/app/chats"
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-0.5"
          >
            <span>All Chats</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {recentChats.length === 0 ? (
          <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-3xl p-5 text-center shadow-sm">
            <MessageCircle size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              No chat histories found.
            </p>
            <button
              onClick={() => navigate('/app/discover')}
              className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-brand hover:bg-brand-light text-slate-900 text-xs font-bold rounded-2xl cursor-pointer"
            >
              <span>Connect with users</span>
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
                  className="flex items-center justify-between p-3.5 bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl shadow-sm hover:border-brand/35 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                      <img src={otherUser.avatar_url || ''} alt={otherUser.display_name || ''} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {otherUser.display_name}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {c.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-350 dark:text-slate-600 shrink-0 ml-2" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Voice Rooms widget */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 font-display">
            Voice Rooms Preview
          </h3>
          <Link
            to="/app/voice"
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-0.5"
          >
            <span>Rooms</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {activeRooms.length === 0 ? (
          <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-3xl p-5 text-center shadow-sm">
            <Radio size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              No live voice lounges right now.
            </p>
            <button
              onClick={() => navigate('/app/voice')}
              className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-brand hover:bg-brand-light text-slate-900 text-xs font-bold rounded-2xl cursor-pointer"
            >
              <span>Host a room</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {activeRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => navigate('/app/voice')}
                className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-3xl p-3 shadow-sm hover:border-brand/40 transition-all cursor-pointer relative"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Live</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {room.title}
                </h4>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2 min-h-6">
                  {room.description}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-50 dark:border-dark-border flex items-center justify-between text-[8px] text-slate-400 dark:text-slate-500">
                  <span className="font-bold">By @{room.host?.username}</span>
                  <span className="bg-slate-100 dark:bg-dark-bg px-1.5 py-0.5 rounded font-semibold text-slate-500">
                    {room.membersCount || 0} active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;
