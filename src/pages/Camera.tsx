import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Zap, RefreshCw, Music, Sparkles, X, Check, Share2, UploadCloud, Smile, Compass, Send, Search, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { musicService } from '@/services/musicService';

const CAM_LANDSCAPES = [
  'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&h=1200&q=80',
  'https://images.unsplash.com/photo-1496568818309-53d7c7753022?auto=format&fit=crop&w=800&h=1200&q=80',
  'https://images.unsplash.com/photo-1518173946687-a4c8a383392c?auto=format&fit=crop&w=800&h=1200&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&h=1200&q=80'
];

const FILTERS = [
  { id: 'none', name: 'Normal', css: '' },
  { id: 'sunset', name: 'Golden Hour ☀️', css: 'sepia contrast-[1.1] hue-rotate-[15deg] saturate-[1.3]' },
  { id: 'neon', name: 'Cyber Neon 🔮', css: 'hue-rotate-[120deg] contrast-[1.25] saturate-[1.4]' },
  { id: 'noir', name: 'Vintage Noir 🎬', css: 'grayscale contrast-[1.4] brightness-[0.9]' },
  { id: 'glimmer', name: 'Dreamy Mist ✨', css: 'blur-[0.5px] brightness-[1.1] saturate-[1.15]' }
];

const MOCK_SONGS = [
  { id: 's1', title: 'Golden Hour', artist: 'JVKE', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 's2', title: 'Night Drive', artist: 'Kavinsky', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 's3', title: 'Bloom', artist: 'The Paper Kites', cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 's4', title: 'Husn', artist: 'Anuv Jain', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=120&h=120&q=80' }
];

const CameraPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [landscapeIndex, setLandscapeIndex] = useState(0);
  const [flashOn, setFlashOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Music attachment
  const [attachedSong, setAttachedSong] = useState<typeof MOCK_SONGS[0] | null>(null);
  const [isAttachingMusic, setIsAttachingMusic] = useState(false);
  const [musicSearchQuery, setMusicSearchQuery] = useState('');

  // Captured snapshot
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capsCaption, setCapsCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WebRTC Camera streams
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    // Request webcam access
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((mediaStream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setCameraActive(true);
          stream = mediaStream;
        }
      })
      .catch((err) => {
        console.log("Webcam access not supported or denied, loading scenic slides engine", err);
        setCameraActive(false);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCycleLandscape = () => {
    setLandscapeIndex((prev) => (prev + 1) % CAM_LANDSCAPES.length);
  };

  const handleShutterClick = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      const snapSource = cameraActive 
        ? 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=400&h=600&q=80' 
        : CAM_LANDSCAPES[landscapeIndex];
      setCapturedImage(snapSource);
    }, 450);
  };

  const handlePostVibe = async () => {
    if (!capturedImage || !profile?.id) return;
    setIsPosting(true);
    setError(null);

    const captionText = capsCaption.trim() || 'Shared from VibeCamera ⚡';
    const sTitle = attachedSong?.title || 'Camera Soundtrack';
    const sArtist = attachedSong?.artist || 'VibeArtist';

    try {
      const posted = await musicService.shareVibe({
        user_id: profile.id,
        title: captionText,
        description: captionText,
        mood: activeFilter.name.split(' ')[0], // Chill, Cyber, etc.
        song_title: sTitle,
        artist_name: sArtist,
        cover_url: capturedImage,
        external_url: null
      });

      if (posted) {
        setCapturedImage(null);
        setAttachedSong(null);
        setCapsCaption('');
        navigate('/app/home');
      }
    } catch (err: any) {
      console.error('Error posting vibe from camera:', err);
      setError('Could not publish snap. Try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const filteredSongs = MOCK_SONGS.filter(s =>
    s.title.toLowerCase().includes(musicSearchQuery.toLowerCase()) ||
    s.artist.toLowerCase().includes(musicSearchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-black relative min-h-0 page-transition text-white h-full overflow-hidden">
      
      {!capturedImage ? (
        /* VIEWFINDER SCREEN */
        <div className="flex-grow flex flex-col justify-between p-4 relative min-h-0">
          
          {/* Viewfinder Stream or slides */}
          <div className="absolute inset-0 z-0">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${activeFilter.css}`}
              />
            ) : (
              <img
                src={CAM_LANDSCAPES[landscapeIndex]}
                alt="viewfinder"
                className={`w-full h-full object-cover transition-all duration-300 ${activeFilter.css}`}
              />
            )}
            
            {/* Shutter flash */}
            {isCapturing && <div className="absolute inset-0 bg-white z-20 animate-pulse" />}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
          </div>

          {/* Top toolbar */}
          <div className="flex items-center justify-between z-10">
            <button
              onClick={() => navigate('/app/home')}
              className="p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <span className="text-[10px] font-bold tracking-widest bg-brand text-slate-900 px-3 py-1.5 rounded-full shadow font-display">
              VIBECAM
            </span>
            <button
              onClick={cameraActive ? undefined : handleCycleLandscape}
              className={`p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white cursor-pointer ${cameraActive ? 'opacity-40' : ''}`}
              title="Cycle Landscape Slides"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          {/* Synced song display inside viewfinder */}
          {attachedSong && (
            <div className="self-center bg-black/60 backdrop-blur-md rounded-full py-1.5 pl-3.5 pr-4 flex items-center gap-2 max-w-[280px] border border-white/10 shadow-lg animate-bounce z-10">
              <Music className="w-3.5 h-3.5 text-brand animate-pulse" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-white truncate">{attachedSong.title}</p>
                <p className="text-[8px] text-gray-300 truncate">{attachedSong.artist}</p>
              </div>
            </div>
          )}

          {/* Viewfinder widgets toolbar */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4.5 z-10">
            <button
              onClick={() => setIsAttachingMusic(true)}
              className={`p-3 bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                attachedSong ? 'border-brand ring-2 ring-brand/10' : 'border-transparent'
              }`}
            >
              <Music size={18} className={attachedSong ? 'text-brand animate-spin-slow' : ''} />
              <span className="text-[7px] font-extrabold uppercase tracking-wider">Music</span>
            </button>
          </div>

          {/* Viewfinder footer */}
          <div className="space-y-4 z-10">
            {/* Filter Slider */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-start px-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    activeFilter.id === f.id
                      ? 'bg-brand text-slate-900 scale-102 shadow-md'
                      : 'bg-black/55 text-gray-300 border border-white/5'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>

            {/* Take picture triggers */}
            <div className="flex items-center justify-center gap-6 pb-2">
              <button
                onClick={handleShutterClick}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-transparent cursor-pointer active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <div className="w-9 h-9 bg-brand rounded-full shadow-inner" />
                </div>
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* PHOTO CAPTURE PREVIEW SCREEN */
        <div className="flex-grow flex flex-col justify-between p-4 relative min-h-0">
          
          {/* Background image preview */}
          <div className="absolute inset-0 z-0">
            <img
              src={capturedImage}
              alt="preview"
              className={`w-full h-full object-cover ${activeFilter.css}`}
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Editor Header */}
          <div className="flex items-center justify-between z-10">
            <button
              onClick={() => setCapturedImage(null)}
              className="p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <span className="text-[10px] font-bold tracking-widest bg-black/50 px-3.5 py-1.5 rounded-full border border-white/10 font-display">
              PREVIEW SNAP
            </span>
            <div className="w-10" />
          </div>

          {/* Editor Caption field */}
          <div className="w-full flex justify-center py-4 bg-black/30 backdrop-blur-sm px-4 rounded-2xl border border-white/5 mx-auto max-w-xs z-10">
            <input
              type="text"
              placeholder="Add snap text caption..."
              value={capsCaption}
              onChange={(e) => setCapsCaption(e.target.value)}
              className="w-full bg-transparent text-center text-xs font-bold placeholder-white/50 focus:placeholder-transparent focus:outline-none text-white font-sans"
            />
          </div>

          {/* Editor Footer */}
          <div className="space-y-4 z-10">
            {error && (
              <div className="p-2.5 bg-red-500/20 border border-red-500/30 text-red-300 text-[10px] rounded-xl flex items-center gap-1.5 justify-center">
                <AlertCircle size={12} />
                <span>{error}</span>
              </div>
            )}

            {attachedSong && (
              <div className="bg-black/80 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={attachedSong.cover} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-white truncate">{attachedSong.title}</p>
                    <p className="text-[8px] text-gray-400 truncate">{attachedSong.artist}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAttachedSong(null)}
                  className="text-[9px] font-bold text-red-400 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}

            <button
              onClick={handlePostVibe}
              disabled={isPosting}
              className="w-full py-3.5 bg-brand hover:bg-brand-light active:bg-brand-dark disabled:opacity-50 text-slate-900 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all font-display"
            >
              <Send size={14} />
              <span>{isPosting ? 'Publishing Snap...' : 'Share to Vibe Lounge'}</span>
            </button>
          </div>

        </div>
      )}

      {/* Music attaching sheet */}
      {isAttachingMusic && (
        <div className="absolute inset-0 bg-black/70 z-30 flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 max-h-[70%] overflow-y-auto shadow-2xl animate-slideUp">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold font-display">
                <Music size={16} className="text-yellow-500" />
                <span>Select Snapshot Soundtrack</span>
              </div>
              <button
                onClick={() => setIsAttachingMusic(false)}
                className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={musicSearchQuery}
                onChange={(e) => setMusicSearchQuery(e.target.value)}
                placeholder="Search tracks..."
                className="block w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            {/* Track rows list */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {filteredSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => {
                    setAttachedSong(song);
                    setIsAttachingMusic(false);
                  }}
                  className="flex items-center justify-between p-2 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={song.cover} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <h4 className="text-[10px] font-bold text-white truncate">{song.title}</h4>
                      <p className="text-[8px] text-gray-400 truncate">{song.artist}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-brand uppercase tracking-wider">Select</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CameraPage;
