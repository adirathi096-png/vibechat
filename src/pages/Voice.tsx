import React, { useEffect, useState } from 'react';
import { Radio, Plus, Mic, MicOff, LogOut, Users, X, Check, Headphones, Sparkles, Volume2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { voiceService } from '@/services/voiceService';
import { VoiceRoom, VoiceRoomMember } from '@/types';

const Voice: React.FC = () => {
  const { profile } = useAuth();
  
  const [rooms, setRooms] = useState<VoiceRoom[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Joined room states
  const [activeJoinedRoom, setActiveJoinedRoom] = useState<VoiceRoom | null>(null);
  const [roomMembers, setRoomMembers] = useState<VoiceRoomMember[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [loadingRoomDetails, setLoadingRoomDetails] = useState(false);

  // Creation Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const list = await voiceService.getActiveRooms();
      setRooms(list);
    } catch (err) {
      console.error('Error loading voice rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();

    // Set up polling for room updates
    const timer = setInterval(() => {
      voiceService.getActiveRooms().then((list) => {
        setRooms(list);
        
        // If we are inside a room, sync members count and listing
        if (activeJoinedRoom) {
          const freshRoom = list.find((r) => r.id === activeJoinedRoom.id);
          if (freshRoom) {
            setActiveJoinedRoom(freshRoom);
          }
          voiceService.getRoomMembers(activeJoinedRoom.id).then(setRoomMembers);
        }
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [activeJoinedRoom?.id]);

  const handleJoinRoom = async (room: VoiceRoom) => {
    if (!profile?.id) return;
    
    // If already in a room, leave it first
    if (activeJoinedRoom) {
      await handleLeaveRoom(activeJoinedRoom.id);
    }

    setLoadingRoomDetails(true);
    try {
      const joined = await voiceService.joinRoom(room.id, profile.id);
      if (joined) {
        setActiveJoinedRoom(room);
        const members = await voiceService.getRoomMembers(room.id);
        setRoomMembers(members);
      }
    } catch (err) {
      console.error('Error joining room:', err);
    } finally {
      setLoadingRoomDetails(false);
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    if (!profile?.id) return;
    try {
      // If we are the host, ending the room will leave it for everyone
      const isHost = activeJoinedRoom?.host_id === profile.id;
      if (isHost) {
        await voiceService.endRoom(roomId);
      } else {
        await voiceService.leaveRoom(roomId, profile.id);
      }
      
      setActiveJoinedRoom(null);
      setRoomMembers([]);
      setIsMuted(false);
      loadRooms();
    } catch (err) {
      console.error('Error leaving room:', err);
    }
  };

  const handleCreateRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    if (!title.trim()) {
      setModalError('Room title is required.');
      return;
    }

    setCreating(true);
    setModalError(null);

    try {
      const created = await voiceService.createRoom(profile.id, title.trim(), description.trim());
      if (created) {
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        
        // Auto join the hosted room
        // Inject host details into local voice room reference
        const fullRoom: VoiceRoom = {
          ...created,
          host: {
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
          membersCount: 1,
        };

        await handleJoinRoom(fullRoom);
        loadRooms();
      }
    } catch (err: any) {
      console.error('Error creating room:', err);
      setModalError(err.message || 'Failed to create room. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-bg page-transition relative min-h-0">
      
      {/* Header */}
      <div className="p-4 bg-white dark:bg-dark-bg border-b border-slate-100 dark:border-dark-border flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">
            Voice Lounges
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Join public audio channels and discuss vibes
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-2xl bg-brand hover:bg-brand-light text-slate-900 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
        >
          <Plus size={16} />
          <span>Host Lounge</span>
        </button>
      </div>

      {/* Rooms list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 scrollbar-thin">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-5 h-5 rounded-full border-2 border-brand/20 border-t-brand animate-spin mx-auto mb-2"></div>
            <span className="text-[10px] font-semibold font-outfit tracking-wider uppercase font-display">Tuning frequencies</span>
          </div>
        ) : rooms.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-full flex items-center justify-center text-slate-350 dark:text-slate-655 shadow-sm mb-4">
              <Radio size={28} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-250 font-display text-sm">
              All lounges are offline
            </h3>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed">
              No audio rooms are currently broadcasting. Start a new topic and invite friends to talk!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-brand hover:bg-brand-light text-slate-900 text-xs font-bold rounded-2xl cursor-pointer"
            >
              <Plus size={14} />
              <span>Host a lounge</span>
            </button>
          </div>
        ) : (
          rooms.map((room) => {
            const isJoined = activeJoinedRoom?.id === room.id;
            return (
              <div
                key={room.id}
                onClick={() => handleJoinRoom(room)}
                className={`bg-white dark:bg-dark-card border rounded-3xl p-4 shadow-sm transition-all cursor-pointer relative ${
                  isJoined 
                    ? 'border-brand ring-2 ring-brand/10' 
                    : 'border-slate-100 dark:border-dark-border hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Live</span>
                  </div>
                  
                  {isJoined && (
                    <span className="text-[9px] font-bold text-brand-dark dark:text-brand bg-yellow-400/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Check size={10} strokeWidth={3} />
                      <span>Listening</span>
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {room.title}
                </h4>
                
                {room.description && (
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 line-clamp-2">
                    {room.description}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-50 dark:border-dark-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100">
                      <img src={room.host?.avatar_url || ''} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-450">
                      Hosted by @{room.host?.username}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                    <Users size={12} />
                    <span>{room.membersCount || 0} participants</span>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Active Joined Room Control Overlay (Persistent Drawer at bottom) */}
      {activeJoinedRoom && (
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-slate-200 dark:border-dark-border p-4 rounded-t-3xl shadow-2xl z-20 space-y-4 animate-slideUp shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand-dark dark:text-brand flex items-center justify-center shrink-0">
                <Volume2 size={18} className="animate-pulse" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-snug">
                  {activeJoinedRoom.title}
                </h3>
                <p className="text-[9px] text-slate-400 dark:text-slate-500">
                  {activeJoinedRoom.host_id === profile?.id ? 'Hosting lounge' : `Listening to @${activeJoinedRoom.host?.username}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mute toggle placeholder */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  isMuted
                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                    : 'bg-slate-50 dark:bg-dark-bg text-slate-500 hover:text-slate-800'
                }`}
              >
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              {/* Leave Room trigger */}
              <button
                onClick={() => handleLeaveRoom(activeJoinedRoom.id)}
                className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/20 hover:bg-red-100 text-red-655 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>{activeJoinedRoom.host_id === profile?.id ? 'End' : 'Leave'}</span>
              </button>
            </div>
          </div>

          {/* Members list inside room */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-dark-border/40">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
              <span>Speakers & Listeners ({roomMembers.length})</span>
              <span className="text-[8px] bg-brand/10 text-brand-dark dark:text-brand px-1.5 py-0.25 rounded font-semibold uppercase tracking-wider">WebRTC Ready</span>
            </div>
            
            {loadingRoomDetails ? (
              <div className="py-2 text-center text-slate-400 text-[10px]">Updating lounge details...</div>
            ) : (
              <div className="flex flex-wrap gap-3 max-h-24 overflow-y-auto pr-1">
                {roomMembers.map((member) => {
                  const isHost = member.user_id === activeJoinedRoom.host_id;
                  return (
                    <div key={member.id} className="flex items-center gap-1.5 bg-slate-50 dark:bg-dark-bg p-1.5 rounded-2xl border border-slate-100 dark:border-dark-border/40 max-w-[120px] truncate shrink-0">
                      <div className="w-5 h-5 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                        <img src={member.user?.avatar_url || ''} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[8px] font-bold text-slate-750 dark:text-slate-350 truncate">
                          {member.user?.display_name?.split(' ')[0]}
                        </span>
                        {isHost && (
                          <span className="block text-[6px] font-extrabold text-yellow-600 uppercase tracking-tighter">Host</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Host Room Creation Slide-Up Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-30 flex flex-col justify-end">
          <div className="bg-white dark:bg-dark-card border-t border-slate-100 dark:border-dark-border rounded-t-3xl max-h-[85%] overflow-y-auto p-5 space-y-4 shadow-2xl animate-slideUp">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-border pb-3">
              <div className="flex items-center gap-1.5">
                <Radio size={18} className="text-yellow-500 animate-pulse" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 font-display">
                  Host a Voice Lounge
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl bg-slate-50 dark:bg-dark-bg text-slate-500 hover:text-slate-800"
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

            <form onSubmit={handleCreateRoomSubmit} className="space-y-4">
              {/* Room Title */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Lounge Topic / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chatting Kavinsky Synth Vibes"
                  className="block w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Lounge Details (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share a short summary about the topic people will speak or hear..."
                  rows={3}
                  className="block w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-brand resize-none"
                  maxLength={150}
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full mt-4 py-3 px-4 border border-transparent rounded-2xl shadow-sm text-xs font-bold text-slate-900 bg-brand hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {creating ? (
                  <div className="w-4 h-4 border-2 border-slate-900/35 border-t-slate-900 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Go Live Now</span>
                    <Sparkles size={14} />
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

export default Voice;
