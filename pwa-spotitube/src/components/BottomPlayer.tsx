import React, { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import { usePlayer } from "../contexts/PlayerContext";
import { searchYouTube } from "../services/youtubeApi";

export default function BottomPlayer() {
  const {
    queue, currentIndex, isPlaying, showVideo,
    play, pause, next, prev, playAt, toggleVideo
  } = usePlayer();

  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [isLoadingYoutube, setIsLoadingYoutube] = useState(false);
  const playerRef = useRef<any>(null);

  const currentTrack = queue[currentIndex];

  // Recherche dynamique YouTube si nécessaire
  useEffect(() => {
    let isActive = true;
    const fetchYoutubeId = async () => {
      setYoutubeId(null);
      setIsLoadingYoutube(true);
      if (!currentTrack) {
        setIsLoadingYoutube(false);
        return;
      }
      if (currentTrack.source === "youtube" && currentTrack.source_id) {
        setYoutubeId(currentTrack.source_id);
        setIsLoadingYoutube(false);
      } else {
        const ytResults = await searchYouTube(`${currentTrack.artist} ${currentTrack.title} official audio`);
        if (isActive) {
          setYoutubeId(ytResults[0]?.youtubeId || null);
          setIsLoadingYoutube(false);
        }
      }
    };
    if (currentTrack) fetchYoutubeId();
    return () => { isActive = false; };
  }, [currentTrack]);

  const opts = {
    height: showVideo ? "360" : "1",
    width: showVideo ? "640" : "1",
    playerVars: { autoplay: 1, controls: 1, modestbranding: 1, rel: 0 },
  };

  const handleEnd = () => next();
  const handleReady = (event: any) => {
    playerRef.current = event.target;
    if (isPlaying) event.target.playVideo();
  };

  if (!currentTrack) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 0, right: 0, bottom: 0,
        background: "#191414",
        color: "#fff",
        zIndex: 1000,
        boxShadow: "0 -2px 12px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        padding: "16px 24px",
        minHeight: 80,
      }}
    >
      {currentTrack.albumArt && (
        <img src={currentTrack.albumArt} alt="" style={{ width: 48, height: 48, borderRadius: 8, marginRight: 16 }} />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{currentTrack.title}</div>
        <div style={{ color: "#b3b3b3", fontSize: 14 }}>{currentTrack.artist}</div>
      </div>
      <button onClick={prev} disabled={currentIndex === 0} style={buttonStyle}>⏮️</button>
      <button
        onClick={() => {
          if (playerRef.current) {
            isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
          }
          isPlaying ? pause() : play();
        }}
        style={buttonStyle}
      >
        {isPlaying ? "⏸️" : "▶️"}
      </button>
      <button onClick={next} disabled={currentIndex === queue.length - 1} style={buttonStyle}>⏭️</button>
      <button onClick={toggleVideo} style={{ ...buttonStyle, marginLeft: 16 }}>
        {showVideo ? "Masquer vidéo" : "Voir vidéo"}
      </button>
      {isLoadingYoutube && <span style={{ marginLeft: 24, color: "#1DB954" }}>Recherche vidéo…</span>}
      {showVideo && youtubeId && (
        <div style={{ position: "absolute", bottom: 90, right: 24, background: "#000", borderRadius: 8 }}>
          <YouTube
            videoId={youtubeId}
            opts={{ width: 400, height: 225, playerVars: { autoplay: 1 } }}
            onEnd={handleEnd}
            onReady={handleReady}
          />
        </div>
      )}
      {/* File d’attente */}
      <div style={{
        position: "absolute", left: 24, bottom: 90, background: "#222", borderRadius: 8, padding: 12, minWidth: 220
      }}>
        <div style={{ color: "#1DB954", marginBottom: 8, fontWeight: 600 }}>À venir</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: 160, overflowY: "auto" }}>
          {queue.map((track, idx) => (
            <li
              key={track.id}
              onClick={() => playAt(idx)}
              style={{
                padding: "4px 0",
                color: idx === currentIndex ? "#1DB954" : "#fff",
                fontWeight: idx === currentIndex ? 700 : 400,
                cursor: "pointer",
                opacity: idx === currentIndex ? 1 : 0.7,
              }}
            >
              {track.title} <span style={{ color: "#b3b3b3", fontSize: 13 }}>– {track.artist}</span>
              {idx === currentIndex && <span style={{ marginLeft: 8 }}>▶️</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  background: "#1DB954",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "8px 18px",
  fontWeight: 600,
  fontSize: 16,
  cursor: "pointer",
  margin: "0 4px",
};
