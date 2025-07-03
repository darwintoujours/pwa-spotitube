import React, { useRef, useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

type Track = {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  albumArt?: string;
};

type Props = {
  tracks: Track[];
  initialIndex?: number;
  onClose?: () => void; // Pour le mini-lecteur flottant
};

export default function YouTubePlaylistPlayer({ tracks, initialIndex = 0, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const playerRef = useRef<any>(null);

  if (!tracks.length) return null;

  // Contrôles
  const playPrev = () => setCurrentIndex(i => (i > 0 ? i - 1 : i));
  const playNext = () => setCurrentIndex(i => (i < tracks.length - 1 ? i + 1 : i));
  const playAt = (idx: number) => setCurrentIndex(idx);

  // Options du player
  const opts: YouTubeProps['opts'] = {
    height: '360',
    width: '640',
    playerVars: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  // Gestion de la fin de vidéo
  const handleEnd = () => {
    if (currentIndex < tracks.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    }
  };

  const handleReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    if (isPlaying) event.target.playVideo();
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  return (
    <div
      style={{
        background: '#222',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
        maxWidth: 700,
        margin: '40px auto 0',
        position: onClose ? 'fixed' : 'relative',
        bottom: onClose ? 24 : undefined,
        right: onClose ? 24 : undefined,
        zIndex: 1000,
      }}
    >
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 8, right: 8,
            background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer'
          }}
        >×</button>
      )}
      <YouTube
        videoId={tracks[currentIndex].youtubeId}
        opts={opts}
        onEnd={handleEnd}
        onReady={handleReady}
        onPlay={handlePlay}
        onPause={handlePause}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0' }}>
        <button onClick={playPrev} disabled={currentIndex === 0} style={buttonStyle}>⏮️ Précédent</button>
        <button onClick={() => setIsPlaying(p => !p)} style={buttonStyle}>
          {isPlaying ? '⏸️ Pause' : '▶️ Lecture'}
        </button>
        <button onClick={playNext} disabled={currentIndex === tracks.length - 1} style={buttonStyle}>⏭️ Suivant</button>
        <span style={{ color: '#fff', marginLeft: 16 }}>
          {currentIndex + 1} / {tracks.length}
        </span>
      </div>
      <div style={{ marginTop: 16 }}>
        <h4 style={{ color: '#1DB954', marginBottom: 8 }}>File d’attente</h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {tracks.map((track, idx) => (
            <li
              key={track.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: idx === currentIndex ? '#333' : 'transparent',
                color: idx === currentIndex ? '#1DB954' : '#fff',
                borderRadius: 8,
                padding: 8,
                marginBottom: 4,
                cursor: 'pointer',
                fontWeight: idx === currentIndex ? 700 : 400,
                opacity: idx === currentIndex ? 1 : 0.7,
              }}
              onClick={() => playAt(idx)}
            >
              {track.albumArt && (
                <img src={track.albumArt} alt={track.title} style={{ width: 32, height: 32, borderRadius: 4, marginRight: 10 }} />
              )}
              <span>{track.title} <span style={{ color: '#b3b3b3', fontSize: 13 }}>– {track.artist}</span></span>
              {idx === currentIndex && <span style={{ marginLeft: 8 }}>▶️</span>}
            </li>
          ))}
        </ul>
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
};