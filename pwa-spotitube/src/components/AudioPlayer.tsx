import React, { useRef, useState } from 'react';

type AudioPlayerProps = {
  trackName: string;
  artist: string;
  previewUrl: string | null;
  albumImage: string;
};

export default function AudioPlayer({ trackName, artist, previewUrl, albumImage }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    if (!previewUrl) return;
    if (playing) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setPlaying(!playing);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: '#222',
      borderRadius: 12,
      padding: 16,
      margin: '24px 0',
      gap: 16
    }}>
      <img src={albumImage} alt={trackName} style={{ width: 64, height: 64, borderRadius: 8 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: '#fff' }}>{trackName}</div>
        <div style={{ color: '#b3b3b3', fontSize: 14 }}>{artist}</div>
      </div>
      {previewUrl ? (
        <>
          <button
            onClick={togglePlay}
            style={{
              background: '#1DB954',
              border: 'none',
              borderRadius: 20,
              color: '#fff',
              fontWeight: 600,
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <audio
            ref={audioRef}
            src={previewUrl}
            onEnded={() => setPlaying(false)}
            style={{ display: 'none' }}
          />
        </>
      ) : (
        <span style={{ color: '#b3b3b3' }}>Pas d'extrait audio</span>
      )}
    </div>
  );
}
