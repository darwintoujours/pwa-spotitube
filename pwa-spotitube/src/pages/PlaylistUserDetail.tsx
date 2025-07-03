import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getTracksForPlaylist } from '../services/playlistTracksService';
import { searchYouTube } from '../services/youtubeApi';
import YouTube from 'react-youtube';

type Track = {
  id: string;
  title: string;
  artist: string;
  source: 'spotify' | 'youtube';
  source_id?: string; // YouTube videoId si source === 'youtube'
  album?: string;
  album_art?: string;
};

export default function PlaylistUserDetail() {
  const { id } = useParams<{ id: string }>();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlistName, setPlaylistName] = useState('');
  const [loading, setLoading] = useState(true);

  // Player state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [isLoadingYoutube, setIsLoadingYoutube] = useState(false);

  const playerRef = useRef<any>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      try {
        const { data: playlist } = await supabase
          .from('playlists')
          .select('name')
          .eq('id', id)
          .single();
        setPlaylistName(playlist?.name || '');

        const data = await getTracksForPlaylist(id!);
        setTracks(data || []);
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
      if (currentTrack.source === 'youtube' && currentTrack.source_id) {
        setYoutubeId(currentTrack.source_id);
        setIsLoadingYoutube(false);
      } else {
        // Recherche YouTube à la volée
        const ytResults = await searchYouTube(`${currentTrack.artist} ${currentTrack.title} official audio`);
        setYoutubeId(ytResults[0]?.youtubeId || null);
        setIsLoadingYoutube(false);
      }
    };
    if (tracks.length) fetchYoutubeId();
    // eslint-disable-next-line
  }, [currentIndex, tracks]);

  // Contrôles du player
  const playPrev = () => setCurrentIndex(i => (i > 0 ? i - 1 : i));
  const playNext = () => setCurrentIndex(i => (i < tracks.length - 1 ? i + 1 : i));
  const playAt = (idx: number) => setCurrentIndex(idx);

  const opts = {
    height: showVideo ? '360' : '1',
    width: showVideo ? '640' : '1',
    playerVars: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  const handleEnd = () => {
    if (currentIndex < tracks.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    }
  };

  const handleReady = (event: any) => {
    playerRef.current = event.target;
    if (isPlaying) event.target.playVideo();
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>Chargement...</div>;
  }

  if (!tracks.length) {
    return (
      <div style={{ maxWidth: 700, margin: '60px auto', padding: 20 }}>
        <Link to="/user-playlists" style={{ color: '#1DB954', textDecoration: 'none', fontWeight: 600 }}>&larr; Retour à mes playlists</Link>
        <h2 style={{ marginTop: 24 }}>{playlistName}</h2>
        <div style={{ color: '#b3b3b3', marginTop: 24 }}>Aucun morceau dans cette playlist.</div>
      </div>
    );
  }

  const currentTrack = tracks[currentIndex];

  return (
    <div style={{ maxWidth: 700, margin: '60px auto', padding: 20, paddingBottom: 120 }}>
      <Link to="/user-playlists" style={{ color: '#1DB954', textDecoration: 'none', fontWeight: 600 }}>&larr; Retour à mes playlists</Link>
      <h2 style={{ marginTop: 24 }}>{playlistName}</h2>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 24 }}>
        {tracks.map((track, idx) => (
          <li key={track.id} style={{
            background: idx === currentIndex ? '#222' : '#191414',
            color: idx === currentIndex ? '#1DB954' : '#fff',
            borderRadius: 8,
            padding: 16,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            cursor: 'pointer',
            fontWeight: idx === currentIndex ? 700 : 400,
            opacity: idx === currentIndex ? 1 : 0.7,
          }}
            onClick={() => playAt(idx)}
          >
            {track.album_art && (
              <img src={track.album_art} alt={track.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
            )}
            <div style={{ flex: 1 }}>
              <div>{track.title}</div>
              <div style={{ color: '#b3b3b3', fontSize: 14 }}>{track.artist}</div>
              {track.album && <div style={{ color: '#b3b3b3', fontSize: 13 }}>{track.album}</div>}
            </div>
            {idx === currentIndex && <span style={{ fontSize: 18, marginLeft: 8 }}>▶️</span>}
          </li>
        ))}
      </ul>

      {/* Player global en bas de page */}
      <div
        style={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          background: '#191414',
          color: '#fff',
          zIndex: 1000,
          boxShadow: '0 -2px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          padding: '16px 24px',
          minHeight: 80,
        }}
      >
        {currentTrack.album_art && (
          <img src={currentTrack.album_art} alt="" style={{ width: 48, height: 48, borderRadius: 8, marginRight: 16 }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{currentTrack.title}</div>
          <div style={{ color: '#b3b3b3', fontSize: 14 }}>{currentTrack.artist}</div>
        </div>
        <button onClick={playPrev} disabled={currentIndex === 0} style={buttonStyle}>⏮️</button>
        <button
          onClick={() => {
            if (playerRef.current) {
              isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
            }
            setIsPlaying(p => !p);
          }}
          style={buttonStyle}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button onClick={playNext} disabled={currentIndex === tracks.length - 1} style={buttonStyle}>⏭️</button>
        <button onClick={() => setShowVideo(v => !v)} style={{ ...buttonStyle, marginLeft: 16 }}>
          {showVideo ? "Masquer vidéo" : "Voir vidéo"}
        </button>
        {isLoadingYoutube && <span style={{ marginLeft: 24, color: '#1DB954' }}>Recherche vidéo…</span>}
        {/* Vidéo affichée uniquement si showVideo */}
        {showVideo && youtubeId && (
          <div style={{ position: 'absolute', bottom: 90, right: 24, background: '#000', borderRadius: 8 }}>
            <YouTube
              videoId={youtubeId}
              opts={{ width: 400, height: 225, playerVars: { autoplay: 1 } }}
              onEnd={handleEnd}
              onReady={handleReady}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  background: '#1DB954',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '8px 18px',
  fontWeight: 600,
  fontSize: 16,
  cursor: 'pointer',
  margin: '0 4px',
};