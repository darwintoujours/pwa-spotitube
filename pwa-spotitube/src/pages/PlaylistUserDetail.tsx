import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { getTracksForPlaylist } from "../services/playlistTracksService";
import { searchYouTube } from "../services/youtubeApi";
import YouTube from "react-youtube";

type Track = {
  id: string;
  title: string;
  artist: string;
  source: "spotify" | "youtube";
  sourceid?: string;
  album?: string;
  albumart?: string;
};

export default function PlaylistUserDetail() {
  const { id } = useParams<{ id: string }>();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlistName, setPlaylistName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Player state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoadingYoutube, setIsLoadingYoutube] = useState(false);
  const playerRef = useRef<any>(null);

  // Récupère la playlist et les morceaux
  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      try {
        const { data: playlist } = await supabase
          .from("playlists")
          .select("name")
          .eq("id", id)
          .single();
        setPlaylistName(playlist?.name || "");
        const data = await getTracksForPlaylist(id!);
        setTracks(data);
        setCurrentIndex(0);
      } catch (err) {
        setTracks([]);
      }
      setLoading(false);
    };
    if (id) fetchTracks();
  }, [id]);

  // Recherche YouTube dynamique pour chaque morceau
  useEffect(() => {
    let isActive = true;
    const fetchYoutubeId = async () => {
      setYoutubeId(null);
      setIsLoadingYoutube(true);
      const currentTrack = tracks[currentIndex];
      if (!currentTrack) {
        setIsLoadingYoutube(false);
        return;
      }
      if (currentTrack.source === "youtube" && currentTrack.sourceid) {
        setYoutubeId(currentTrack.sourceid);
        setIsLoadingYoutube(false);
      } else {
        const ytResults = await searchYouTube(
          `${currentTrack.artist} ${currentTrack.title} official audio`
        );
        if (isActive) {
          setYoutubeId(ytResults[0]?.youtubeId || null);
          setIsLoadingYoutube(false);
        }
      }
    };
    fetchYoutubeId();
    return () => {
      isActive = false;
    };
  }, [tracks, currentIndex]);

  // Contrôles du player
  const playPrev = () => setCurrentIndex(i => (i > 0 ? i - 1 : i));
  const playNext = () => setCurrentIndex(i => (i < tracks.length - 1 ? i + 1 : i));
  const playAt = (idx: number) => setCurrentIndex(idx);

  const handleReady = (event: any) => {
    playerRef.current = event.target;
    if (isPlaying) event.target.playVideo();
  };

  const handlePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleEnd = () => {
    playNext();
    setIsPlaying(true);
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: 40 }}>Chargement...</div>;
  if (!tracks.length)
    return (
      <div style={{ maxWidth: 700, margin: "60px auto", padding: 20 }}>
        <Link to="/user-playlists" style={{ color: "#1DB954", textDecoration: "none", fontWeight: 600 }}>
          Retour mes playlists
        </Link>
        <h2 style={{ marginTop: 24 }}>{playlistName}</h2>
        <div style={{ color: "#b3b3b3", marginTop: 24 }}>Aucun morceau dans cette playlist.</div>
      </div>
    );

  const currentTrack = tracks[currentIndex];

  return (
    <div style={{ maxWidth: 700, margin: "60px auto", padding: 20, paddingBottom: 120 }}>
      <Link to="/user-playlists" style={{ color: "#1DB954", textDecoration: "none", fontWeight: 600 }}>
        Retour mes playlists
      </Link>
      <h2 style={{ marginTop: 24 }}>{playlistName}</h2>
      <ul style={{ listStyle: "none", padding: 0, marginTop: 24 }}>
        {tracks.map((track, idx) => (
          <li
            key={track.id}
            style={{
              background: idx === currentIndex ? "#222" : "#191414",
              color: idx === currentIndex ? "#1DB954" : "#fff",
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 16,
              cursor: "pointer",
              fontWeight: idx === currentIndex ? 700 : 400,
              opacity: idx === currentIndex ? 1 : 0.7,
            }}
            onClick={() => playAt(idx)}
          >
            {track.albumart && (
              <img src={track.albumart} alt={track.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{track.title}</div>
              <div style={{ color: "#b3b3b3", fontSize: 14 }}>{track.artist}</div>
              {track.album && <div style={{ color: "#b3b3b3", fontSize: 13 }}>{track.album}</div>}
            </div>
            {idx === currentIndex && (
              <svg width="26" height="26" viewBox="0 0 46 46" fill="none">
                <circle cx="13" cy="13" r="13" fill="#1DB954" />
                <polygon points="10,8 22,13 10,18" fill="#fff" />
              </svg>
            )}
          </li>
        ))}
      </ul>

      {/* Player global en bas de page */}
      {currentTrack && (
        <div
          style={{
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
            padding: "16px 24px",
            minHeight: 80,
          }}
        >
          {currentTrack.albumart && (
            <img src={currentTrack.albumart} alt="" style={{ width: 48, height: 48, borderRadius: 8 }} />
          )}
          <div style={{ flex: 1, marginLeft: 16 }}>
            <div style={{ fontWeight: 600 }}>{currentTrack.title}</div>
            <div style={{ color: "#b3b3b3", fontSize: 14 }}>{currentTrack.artist}</div>
          </div>
          <IconButton onClick={playPrev} disabled={currentIndex === 0} label="Précédent">
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
          <IconButton onClick={playNext} disabled={currentIndex >= tracks.length - 1} label="Suivant">
            {/* Next SVG */}
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="18" fill="#222" />
              <polygon points="14,11 14,25 23,18" fill="#fff" />
              <rect x="23.5" y="11" width="2.5" height="14" rx="1.2" fill="#fff" />
            </svg>
          </IconButton>
          <span style={{ color: "#fff", marginLeft: 16 }}>{currentIndex + 1} / {tracks.length}</span>
          {isLoadingYoutube && <span style={{ color: "#1DB954", marginLeft: 16 }}>Recherche vidéo…</span>}
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
        </div>
      )}
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