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
  } = usePlayer();

  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const playerRef = useRef<any>(null);

  const currentTrack = queue[currentIndex];

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
      {currentTrack.albumArt && (
        <img src={currentTrack.albumArt} alt="" style={{ width: 48, height: 48, borderRadius: 8 }} />
      )}
      <div style={{ flex: 1, marginLeft: 16 }}>
        <div style={{ fontWeight: 600 }}>{currentTrack.title}</div>
        <div style={{ color: "#b3b3b3", fontSize: 14 }}>{currentTrack.artist}</div>
      </div>
      <IconButton onClick={prev} disabled={currentIndex === 0} label="Précédent">
        {/* Previous SVG */}
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="18" fill="#222" />
          <polygon points="22,11 22,25 13,18" fill="#fff" />
          <rect x="10" y="11" width="2.5" height="14" rx="1.2" fill="#fff" />
        </svg>
      </IconButton>
      <IconButton onClick={handlePlayPause} label={isPlaying ? "Pause" : "Lecture"}>
        {/* Play/Pause SVG */}
        {isPlaying ? (
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
            <circle cx="23" cy="23" r="23" fill="#1DB954" />
            <rect x="15" y="14" width="5" height="18" rx="2.5" fill="#fff" />
            <rect x="26" y="14" width="5" height="18" rx="2.5" fill="#fff" />
          </svg>
        ) : (
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
            <circle cx="23" cy="23" r="23" fill="#1DB954" />
            <polygon points="18,14 33,23 18,32" fill="#fff" />
          </svg>
        )}
      </IconButton>
      <IconButton onClick={next} disabled={currentIndex >= queue.length - 1} label="Suivant">
        {/* Next SVG */}
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="18" fill="#222" />
          <polygon points="14,11 14,25 23,18" fill="#fff" />
          <rect x="23.5" y="11" width="2.5" height="14" rx="1.2" fill="#fff" />
        </svg>
      </IconButton>
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

// Bouton d’icône accessible (recommandé pour l’accessibilité)
function IconButton({ onClick, disabled, label, children }: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        margin: "0 8px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        outline: "none",
        display: "flex",
        alignItems: "center"
      }}
    >
      {children}
    </button>
  );
}