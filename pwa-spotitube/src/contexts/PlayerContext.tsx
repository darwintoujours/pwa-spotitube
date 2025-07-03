import React, { createContext, useContext, useState, useCallback } from "react";

type Track = {
  id: string;
  title: string;
  artist: string;
  source: 'spotify' | 'youtube';
  source_id?: string;
  albumArt?: string;
};

type PlayerContextType = {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  showVideo: boolean;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  playAt: (idx: number) => void;
  toggleVideo: () => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueueState] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const setQueue = useCallback((tracks: Track[], startIndex = 0) => {
    setQueueState(tracks);
    setCurrentIndex(startIndex);
    setIsPlaying(true);
  }, []);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const next = () => setCurrentIndex(i => (i < queue.length - 1 ? i + 1 : i));
  const prev = () => setCurrentIndex(i => (i > 0 ? i - 1 : i));
  const playAt = (idx: number) => setCurrentIndex(idx);
  const toggleVideo = () => setShowVideo(v => !v);

  return (
    <PlayerContext.Provider value={{
      queue, currentIndex, isPlaying, showVideo,
      setQueue, play, pause, next, prev, playAt, toggleVideo
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};