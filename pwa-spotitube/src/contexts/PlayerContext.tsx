import React, { createContext, useContext, useState, useCallback } from "react";

// Type d’un morceau
export type Track = {
  id: string;
  title: string;
  artist: string;
  albumArt?: string;
  source: "spotify" | "youtube";
  sourceid?: string; // ID YouTube si source YouTube
};

// Type du contexte
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

  // Met à jour la file d’attente et lance la lecture à partir d’un index donné (par défaut 0)
  const setQueue = useCallback((tracks: Track[], startIndex: number = 0) => {
    setQueueState(tracks);
    setCurrentIndex(startIndex);
    setIsPlaying(true);
  }, []);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const next = useCallback(() => {
    setCurrentIndex(i => (i < queue.length - 1 ? i + 1 : i));
    setIsPlaying(true);
  }, [queue.length]);
  const prev = useCallback(() => {
    setCurrentIndex(i => (i > 0 ? i - 1 : i));
    setIsPlaying(true);
  }, []);
  const playAt = useCallback((idx: number) => {
    setCurrentIndex(idx);
    setIsPlaying(true);
  }, []);
  const toggleVideo = useCallback(() => setShowVideo(v => !v), []);

  return (
    <PlayerContext.Provider
      value={{
        queue,
        currentIndex,
        isPlaying,
        showVideo,
        setQueue,
        play,
        pause,
        next,
        prev,
        playAt,
        toggleVideo,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

// Hook pour utiliser le player partout
export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}