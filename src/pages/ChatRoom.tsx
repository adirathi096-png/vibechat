import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, Headphones } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chatService';
import { profileService } from '@/services/profileService';
import { Message, Profile } from '@/types';

const ChatRoom: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch initial history
  useEffect(() => {
    if (!conversationId || !profile?.id) return;

    const loadChatData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch conversation history
        const history = await chatService.getMessages(conversationId);
        setMessages(history);

        // Deduce other user details
        const list = await chatService.getConversations(profile.id);
        const convo = list.find((c) => c.id === conversationId);
        const members = convo?.members || [];
        
        let target = members.find((m) => m.id !== profile.id) || null;

        // Fallback fetch if otherUser details aren't in cached conversation list
        if (!target && history.length > 0) {
          const firstOther = history.find((m) => m.sender_id !== profile.id);
          if (firstOther && firstOther.sender) {
            target = firstOther.sender;
          }
        }

        // If target is still null, fetch from member list table in Supabase
        if (!target) {
          const memberRecords = await chatService.getConversations(profile.id);
          const found = memberRecords.find((c) => c.id === conversationId);
          target = found?.members?.find((m) => m.id !== profile.id) || null;
        }

        setOtherUser(target);
      } catch (err) {
        console.error('Error loading chat:', err);
        setError('Could not load chat messages. Please try again.');
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 50);
      }
    };

    loadChatData();
  }, [conversationId, profile?.id]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!conversationId) return;

    const subscription = chatService.subscribeToMessages(conversationId, (newMsg) => {
      setMessages((prev) => {
        // Prevent duplicate logs if insertion fires twice
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setTimeout(scrollToBottom, 50);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId || !profile?.id) return;

    const textToSend = input.trim();
    setInput('');

    try {
      const sent = await chatService.sendMessage(conversationId, profile.id, textToSend);
      if (sent) {
        // Locally append message immediately for better perceived speed
        const localMsg: Message = {
          ...sent,
          sender: {
            id: profile.id,
            display_name: profile.display_name,
            username: profile.username,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            college: profile.college,
            interests: profile.interests,
            profile_completed: profile.profile_completed,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
          },
        };
        setMessages((prev) => {
          if (prev.some((m) => m.id === localMsg.id)) return prev;
          return [...prev, localMsg];
        });
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Message failed to send. Try again.');
    }
  };

  const formatMessageTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-dark-bg text-slate-500">
        <div className="w-6 h-6 rounded-full border-2 border-brand/25 border-t-brand animate-spin mb-2"></div>
        <span className="text-xs font-semibold text-slate-400 font-outfit uppercase">Connecting chat...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-bg h-full relative min-h-0 page-transition">
      
      {/* Header */}
      <header className="px-4 py-3 bg-white dark:bg-dark-bg border-b border-slate-100 dark:border-dark-border flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/app/chats')}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-200 border border-slate-100 dark:border-dark-border shrink-0">
              <img src={otherUser?.avatar_url || ''} alt={otherUser?.display_name || ''} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {otherUser?.display_name || 'VibeUser'}
              </h3>
              <p className="text-[9px] text-green-500 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span>Active</span>
              </p>
            </div>
          </div>
        </div>

        {/* Music feed shortcut */}
        <button
          onClick={() => navigate('/app/music')}
          className="p-2 rounded-xl bg-yellow-400/10 hover:bg-yellow-400/20 text-brand-dark dark:text-brand transition-colors cursor-pointer"
          title="Share Vibes"
        >
          <Headphones size={18} />
        </button>
      </header>

      {/* Error Message Box */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/35 flex items-center justify-between text-red-600 dark:text-red-400 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="font-bold underline uppercase text-[10px]">Dismiss</button>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-full flex items-center justify-center text-brand-dark dark:text-brand shadow-sm mb-4">
              <Send size={20} className="ml-0.5" />
            </div>
            <h4 className="font-bold text-slate-700 dark:text-slate-350 font-display text-xs">
              Say hello to {otherUser?.display_name}!
            </h4>
            <p className="mt-1 text-[10px] text-slate-400 max-w-[180px] leading-relaxed">
              Start your chat by sending a friendly text, sharing vibe suggestions, or playlists.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === profile?.id;
            return (
              <div
                key={m.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm text-xs leading-relaxed ${
                    isMe
                      ? 'bg-brand text-slate-900 rounded-tr-none font-medium'
                      : 'bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-dark-border rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  <span
                    className={`block text-[8px] text-right mt-1 font-semibold tracking-tighter ${
                      isMe ? 'text-slate-800/60' : 'text-slate-400'
                    }`}
                  >
                    {formatMessageTime(m.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white dark:bg-dark-bg border-t border-slate-100 dark:border-dark-border flex items-center gap-2 shrink-0 z-10"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Chat with ${otherUser?.display_name?.split(' ')[0] || 'friend'}...`}
          className="flex-1 px-4 py-3 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-brand focus:border-transparent transition-colors"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-3 rounded-2xl bg-brand hover:bg-brand-light text-slate-900 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <Send size={16} />
        </button>
      </form>

    </div>
  );
};

export default ChatRoom;
