import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlayer } from "../contexts/PlayerContext";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext"; // ajouté ici

type Playlist = {
  id: string;
  name: string;
  images: { url: string }[];
  tracks: { total: number };
};

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const { accessToken } = useSpotifyToken(); // ajouté ici

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!accessToken) { // ajouté ici
        setLoading(false);
        return;
      }

      const res = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: {
          Authorization: `Bearer ${accessToken}`, // ajouté ici
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data.items);
      }
      setLoading(false);
    };
    fetchPlaylists();
  }, [accessToken]); // ajouté ici

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 100 }}>Chargement des playlists...</div>;
  }

  return (
    <div style={{ maxWidth: 700, margin: '60px auto', padding: 20 }}>
      <h2>Mes Playlists Spotify</h2>
      {/* ajouté ici : debug token, optionnel */}
      <div style={{ fontSize: 12, color: "#b3b3b3", marginBottom: 12 }}>
        Token Spotify : {accessToken ? "✅ Présent" : "❌ Absent"}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {playlists.map((pl) => (
          <Link
            key={pl.id}
            to={`/playlists/${pl.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                width: 200,
                background: '#191414',
                borderRadius: 12,
                padding: 16,
                boxShadow: '0 2px 8px #0002',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <img
                src={pl.images?.[0]?.url || 'https://via.placeholder.com/200x200?text=Playlist'}
                alt={pl.name}
                style={{ width: '100%', borderRadius: 8, marginBottom: 12 }}
              />
              <div style={{ fontWeight: 600, color: '#fff', marginBottom: 8 }}>{pl.name}</div>
              <div style={{ color: '#b3b3b3', fontSize: 14 }}>
                {pl.tracks.total} titre{pl.tracks.total > 1 ? 's' : ''}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}