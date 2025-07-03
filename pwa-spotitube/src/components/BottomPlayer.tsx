// src/components/BottomPlayer.tsx
import React, { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import { usePlayer } from "../contexts/PlayerContext";
import { searchYouTube } from "../services/youtubeApi";

export default function BottomPlayer() {
  const {
    queue,
    currentIndex,
    isPlaying,
    play,
    pause,
    next,
    prev,
    playAt,
  } = usePlayer();

  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const playerRef = useRef<any>(null);

  const currentTrack = queue[currentIndex];

  // Recherche dynamique de la vidéo YouTube à chaque changement de morceau
  useEffect(() => {
    let isActive = true;
    const fetchYoutubeId = async () => {
      setYoutubeId(null);
      setLoading(true);
      if (!currentTrack) {
        setLoading(false);
        return;
      }
      if (currentTrack.source === "youtube" && currentTrack.sourceid) {
        setYoutubeId(currentTrack.sourceid);
        setLoading(false);
      } else {
        // Recherche YouTube dynamique à chaque lecture
        const ytResults = await searchYouTube(
          `${currentTrack.artist} ${currentTrack.title} official audio`
        );
        if (isActive) {
          setYoutubeId(ytResults[0]?.youtubeId || null);
          setLoading(false);
        }
      }
    };
    fetchYoutubeId();
    return () => {
      isActive = false;
    };
  }, [currentTrack]);

  // Contrôle du player YouTube via l'API
  const handleReady = (event: any) => {
    playerRef.current = event.target;
    if (isPlaying) event.target.playVideo();
  };
  const handlePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      pause();
    } else {
      playerRef.current.playVideo();
      play();
    }
  };
  const handleEnd = () => {
    next();
  };

  if (!currentTrack) return null;

  return (
    <div style={{
      position: "fixed",
      left: 0,
      right: 0,
      bottom: 0,
      background: "#191414",
      color: "#fff",
      zIndex: 1000,
      boxShadow: "0 -2px 12px rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      padding: "12px 24px",
      minHeight: 88,
    }}>
      {/* Pochette */}
      {currentTrack.albumArt && (
        <img src={currentTrack.albumArt} alt="" style={{ width: 48, height: 48, borderRadius: 8 }} />
      )}
      {/* Infos */}
      <div style={{ flex: 1, marginLeft: 16 }}>
        <div style={{ fontWeight: 600 }}>{currentTrack.title}</div>
        <div style={{ color: "#b3b3b3", fontSize: 14 }}>{currentTrack.artist}</div>
      </div>
      {/* Contrôles */}
      <button onClick={prev} style={btnStyle} disabled={currentIndex === 0}>⏮️</button>
      <button onClick={handlePlayPause} style={btnStyle}>
        {isPlaying ? "⏸️" : "▶️"}
      </button>
      <button onClick={next} style={btnStyle} disabled={currentIndex >= queue.length - 1}>⏭️</button>
      {/* Player YouTube invisible (audio only) */}
      {youtubeId && (
        <YouTube
          videoId={youtubeId}
          opts={{
            height: "0",
            width: "0",
            playerVars: {
              autoplay: 1,
              controls: 0,
              modestbranding: 1,
              rel: 0,
            },
          }}
          onReady={handleReady}
          onEnd={handleEnd}
        />
      )}
      {loading && <span style={{ color: "#1DB954", marginLeft: 16 }}>Recherche vidéo…</span>}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "#222",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "8px 16px",
  fontWeight: 600,
  fontSize: 18,
  cursor: "pointer",
  margin: "0 4px",
};