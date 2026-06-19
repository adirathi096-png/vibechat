import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, UserCheck, MessageSquare, Sparkles, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/profileService';
import { friendService } from '@/services/friendService';
import { chatService } from '@/services/chatService';
import { Profile } from '@/types';

interface DiscoverUserCard {
  profile: Profile;
  friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
  requestId?: string;
}

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<DiscoverUserCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsersAndStatus = async (searchQuery: string) => {
    if (!profile?.id) return;
    setLoading(true);

    try {
      let results: Profile[] = [];
      if (searchQuery.trim().length > 0) {
        results = await profileService.searchProfiles(searchQuery.trim(), profile.id);
      } else {
        results = await profileService.getSuggestedProfiles(profile.id);
      }

      // Check friendship relationship status for each returned user card
      const mapped: DiscoverUserCard[] = [];
      for (const p of results) {
        const { status, requestId } = await friendService.getFriendshipStatus(profile.id, p.id);
        mapped.push({
          profile: p,
          friendshipStatus: status,
          requestId,
        });
      }

      setUsers(mapped);
    } catch (err) {
      console.error('Error fetching search results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndStatus('');
  }, [profile?.id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsersAndStatus(query);
  };

  const handleAddFriend = async (targetUserId: string) => {
    if (!profile?.id) return;
    try {
      const sent = await friendService.sendFriendRequest(profile.id, targetUserId);
      if (sent) {
        setUsers((prev) =>
          prev.map((item) =>
            item.profile.id === targetUserId
              ? { ...item, friendshipStatus: 'pending_sent', requestId: sent.id }
              : item
          )
        );
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
    }
  };

  const handleAcceptRequest = async (requestId: string, targetUserId: string) => {
    try {
      const accepted = await friendService.respondToFriendRequest(requestId, 'accepted');
      if (accepted) {
        setUsers((prev) =>
          prev.map((item) =>
            item.profile.id === targetUserId
              ? { ...item, friendshipStatus: 'accepted' }
              : item
          )
        );
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
    }
  };

  const handleStartChat = async (targetUserId: string) => {
    if (!profile?.id) return;
    try {
      const convoId = await chatService.getOrCreateDirectChat(profile.id, targetUserId);
      if (convoId) {
        navigate(`/app/chats/${convoId}`);
      }
    } catch (err) {
      console.error('Error opening chat:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-bg page-transition">
      {/* Header and Search input */}
      <div className="p-4 bg-white dark:bg-dark-bg border-b border-slate-100 dark:border-dark-border space-y-3 shrink-0">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">
          Discover
        </h2>

        <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username or display name..."
              className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card text-slate-800 dark:text-slate-100 placeholder-slate-450 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-2xl bg-brand hover:bg-brand-light text-slate-900 text-xs font-bold transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Suggested / Results lists */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <Sparkles size={14} className="text-yellow-500" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-455 font-display">
            {query.trim().length > 0 ? 'Search Results' : 'Suggested for you'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <div className="w-5 h-5 rounded-full border-2 border-brand/20 border-t-brand animate-spin mb-2"></div>
            <span className="text-[11px] font-semibold tracking-wider font-outfit uppercase">Searching users</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-3xl shadow-sm">
            <Search className="mx-auto text-slate-300 dark:text-slate-600 mb-2 animate-pulse" size={24} />
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              No results found.
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Try spelling the name differently or search for registered accounts like "mia.vibes".
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map(({ profile: u, friendshipStatus, requestId }) => (
              <div
                key={u.id}
                className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-3xl p-4 shadow-sm flex items-center justify-between gap-4"
              >
                {/* User Info details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-150 border border-slate-100 dark:border-dark-border shrink-0 flex items-center justify-center">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt={u.display_name || ''} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-slate-800">
                        {u.display_name?.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {u.display_name}
                    </h4>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                      @{u.username}
                    </p>
                    {u.bio && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {u.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Friendship Trigger actions */}
                <div className="shrink-0">
                  {friendshipStatus === 'none' && (
                    <button
                      onClick={() => handleAddFriend(u.id)}
                      className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-dark-bg dark:hover:bg-slate-800 border border-slate-200 dark:border-dark-border hover:border-slate-350 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <UserPlus size={14} />
                      <span>Add</span>
                    </button>
                  )}

                  {friendshipStatus === 'pending_sent' && (
                    <button
                      disabled
                      className="px-3 py-2 bg-slate-50 dark:bg-dark-bg border border-slate-150 dark:border-dark-border rounded-xl text-xs font-bold text-slate-400 flex items-center gap-1 opacity-70 cursor-not-allowed"
                    >
                      <Clock size={14} />
                      <span>Sent</span>
                    </button>
                  )}

                  {friendshipStatus === 'pending_received' && (
                    <button
                      onClick={() => requestId && handleAcceptRequest(requestId, u.id)}
                      className="px-3.5 py-2 bg-brand hover:bg-brand-light text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <UserCheck size={14} />
                      <span>Accept</span>
                    </button>
                  )}

                  {friendshipStatus === 'accepted' && (
                    <button
                      onClick={() => handleStartChat(u.id)}
                      className="px-3.5 py-2 bg-yellow-400/10 hover:bg-yellow-400/20 text-brand-dark dark:text-brand border border-yellow-400/20 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <MessageSquare size={14} />
                      <span>Chat</span>
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
