import React, { useEffect, useState } from "react";
import { useSpotifyToken } from "../contexts/SpotifyTokenContext";

type Playlist = {
  id: string;
  name: string;
  images: { url: string }[];
};

export default function UserPlaylists() {
  const { accessToken } = useSpotifyToken();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    fetch("https://api.spotify.com/v1/me/playlists?limit=20", {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setPlaylists(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [accessToken]);

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Mes Playlists Spotify</h2>
      {loading && <div>Chargement…</div>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {playlists.map(pl => (
          <li key={pl.id} style={{
            background: "#191414", color: "#fff", borderRadius: 8, padding: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 16
          }}>
            {pl.images[0]?.url && (
              <img src={pl.images[0].url} alt={pl.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
            )}
            <div style={{ flex: 1 }}>{pl.name}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
