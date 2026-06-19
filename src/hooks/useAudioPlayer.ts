import { create } from 'zustand';
import { Vibe } from '@/types';

interface AudioPlayerState {
  currentVibeId: string | null;
  isPlaying: boolean;
  trackTitle: string | null;
  artistName: string | null;
  coverUrl: string | null;
  streamUrl: string | null;
  progress: number; // 0 to 100
  duration: number; // in seconds
  currentTime: number; // in seconds
  playVibe: (vibe: Vibe) => void;
  playTrackPreview: (title: string, artist: string, coverUrl: string, streamUrl: string) => void;
  togglePlay: () => void;
  stop: () => void;
  setProgress: (percent: number) => void;
}

// Single persistent Audio element to prevent overlapping audio streams
const globalAudio = new Audio();

export const useAudioPlayer = create<AudioPlayerState>((set, get) => {
  // Bind audio element events to update Zustand state
  globalAudio.addEventListener('timeupdate', () => {
    const cur = globalAudio.currentTime;
    const dur = globalAudio.duration || 0;
    set({
      currentTime: cur,
      duration: dur,
      progress: dur > 0 ? (cur / dur) * 100 : 0,
    });
  });

  globalAudio.addEventListener('ended', () => {
    set({ isPlaying: false, progress: 0, currentTime: 0 });
  });

  globalAudio.addEventListener('error', (e) => {
    console.error('Audio playback error:', e);
    set({ isPlaying: false });
  });

  return {
    currentVibeId: null,
    isPlaying: false,
    trackTitle: null,
    artistName: null,
    coverUrl: null,
    streamUrl: null,
    progress: 0,
    duration: 0,
    currentTime: 0,

    playVibe: (vibe: Vibe) => {
      // Determine stream URL: check external_url first (if it's an Audius stream or direct MP3)
      // If external_url is empty, we fall back to a royalty-free template track
      const stream = vibe.external_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      const isSame = get().currentVibeId === vibe.id;

      if (isSame) {
        get().togglePlay();
        return;
      }

      // Stop current playback
      globalAudio.pause();
      globalAudio.src = stream;
      globalAudio.load();

      set({
        currentVibeId: vibe.id,
        trackTitle: vibe.song_title,
        artistName: vibe.artist_name,
        coverUrl: vibe.cover_url,
        streamUrl: stream,
        isPlaying: true,
        progress: 0,
        currentTime: 0,
      });

      globalAudio.play().catch((err) => {
        console.error('Playback trigger failed:', err);
        set({ isPlaying: false });
      });
    },

    playTrackPreview: (title: string, artist: string, coverUrl: string, streamUrl: string) => {
      const previewId = `preview-${title}-${artist}`;
      const isSame = get().currentVibeId === previewId;

      if (isSame) {
        get().togglePlay();
        return;
      }

      globalAudio.pause();
      globalAudio.src = streamUrl;
      globalAudio.load();

      set({
        currentVibeId: previewId,
        trackTitle: title,
        artistName: artist,
        coverUrl: coverUrl,
        streamUrl: streamUrl,
        isPlaying: true,
        progress: 0,
        currentTime: 0,
      });

      globalAudio.play().catch((err) => {
        console.error('Preview playback failed:', err);
        set({ isPlaying: false });
      });
    },

    togglePlay: () => {
      const { isPlaying, streamUrl } = get();
      if (!streamUrl) return;

      if (isPlaying) {
        globalAudio.pause();
        set({ isPlaying: false });
      } else {
        globalAudio.play().catch((err) => {
          console.error('Playback resume failed:', err);
        });
        set({ isPlaying: true });
      }
    },

    stop: () => {
      globalAudio.pause();
      globalAudio.currentTime = 0;
      set({
        currentVibeId: null,
        isPlaying: false,
        trackTitle: null,
        artistName: null,
        coverUrl: null,
        streamUrl: null,
        progress: 0,
        currentTime: 0,
      });
    },

    setProgress: (percent: number) => {
      const { duration } = get();
      if (duration === 0) return;
      const targetTime = (percent / 100) * duration;
      globalAudio.currentTime = targetTime;
      set({ currentTime: targetTime, progress: percent });
    },
  };
});
