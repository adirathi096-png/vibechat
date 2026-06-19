import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chatService';
import { Conversation } from '@/types';

const Chats: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadConversations = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);
      const list = await chatService.getConversations(profile.id);
      setConversations(list);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    
    // Set up polling or interval for conversation updates if real-time messages bubble up
    const interval = setInterval(() => {
      if (profile?.id) {
        chatService.getConversations(profile.id).then(setConversations);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [profile?.id]);

  const filteredConversations = conversations.filter((c) => {
    const otherUser = c.members?.find((m) => m.id !== profile?.id);
    if (!otherUser) return false;
    const query = searchQuery.toLowerCase();
    return (
      otherUser.display_name?.toLowerCase().includes(query) ||
      otherUser.username?.toLowerCase().includes(query)
    );
  });

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    
    // If today, show HH:MM
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If yesterday, show 'Yesterday'
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-dark-bg text-slate-500">
        <div className="w-6 h-6 rounded-full border-2 border-brand/25 border-t-brand animate-spin mb-2"></div>
        <span className="text-xs font-semibold text-slate-400 font-outfit uppercase">Fetching channels</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-bg page-transition">
      {/* Search and Filters Header */}
      <div className="p-4 bg-white dark:bg-dark-bg border-b border-slate-100 dark:border-dark-border space-y-3 shrink-0">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">
          Chats
        </h2>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active chats..."
            className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card text-slate-800 dark:text-slate-100 placeholder-slate-450 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-0">
        {filteredConversations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-full flex items-center justify-center text-slate-350 dark:text-slate-600 shadow-sm mb-4">
              <MessageCircle size={28} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-250 font-display text-sm">
              {searchQuery ? 'No matching chats' : 'No chats yet'}
            </h3>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed font-medium">
              {searchQuery 
                ? 'Try searching with a different name or username.' 
                : 'Connect with other music lovers in the community to start conversations!'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/app/discover')}
                className="mt-4 inline-flex items-center gap-1 px-4 py-2.5 bg-brand hover:bg-brand-light text-slate-900 text-xs font-bold rounded-2xl cursor-pointer transition-colors shadow-sm"
              >
                <UserPlus size={14} />
                <span>Find friends</span>
              </button>
            )}
          </div>
        ) : (
          filteredConversations.map((c) => {
            const otherUser = c.members?.find((m) => m.id !== profile?.id);
            if (!otherUser) return null;

            return (
              <div
                key={c.id}
                onClick={() => navigate(`/app/chats/${c.id}`)}
                className="flex items-center justify-between p-3.5 bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl hover:border-brand/40 shadow-sm hover:shadow transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Avatar */}
                  <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-slate-200 border border-slate-100 dark:border-dark-border shrink-0">
                    {otherUser.avatar_url ? (
                      <img src={otherUser.avatar_url} alt={otherUser.display_name || ''} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-sm bg-brand/10 text-slate-800">
                        {otherUser.display_name?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                      {otherUser.display_name}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 max-w-[200px]">
                      {c.lastMessage?.content || 'Tap to send a vibe message'}
                    </p>
                  </div>
                </div>

                {/* Right side Metadata */}
                <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                  <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
                    {c.lastMessage ? formatTime(c.lastMessage.created_at) : ''}
                  </span>
                  
                  {/* Unread indicators - check if last message isn't read and sender is not me */}
                  {c.lastMessage && !c.lastMessage.read_at && c.lastMessage.sender_id !== profile?.id ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse"></div>
                  ) : (
                    <ArrowRight size={12} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Chats;
